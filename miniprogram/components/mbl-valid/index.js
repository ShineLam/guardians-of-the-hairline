const {mixin, api, util, conf} = require('../../utils/mixin.js')
Component(mixin.component({
  ctx: null,
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {

  },
  lifetimes: {
    ready() {
      this.popup = this.selectComponent("#popup")
    }
  },
  data: {
    validType: '', // 获取微信手机号码方式: wechat; 用户输入手机方式: custom
    kbNum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    kbType: 'num_mbl',
    disSendSms: false,
    showTips: false,
    title: '验证手机号',
    desc: '为了保证账户安全, 需验证手机号码',
    btnTxt: '完成',
    codeTxt: '获取验证码',
    errMsg: '',
    max: 11,
    str: '',
    biz: 'vld.mbl', // 默认: vld.mbl; 油站用户: vld.mbl_oilusr;
    form: {
      mbl: '',
      smsCode: '',
      smsKey: ''
    },
    _cb: null,
    _fb: null,
    _chKMblfn: null
  },
  methods: {
    // 打开
    open(opts, cb, fb) {
      this.ctx = {opts, cb, fb}
      // this.show(true)
      // 如果mbl是字符串，则认为是手机号，否则认为是对象
      let params = typeof (opts) === 'string' ? {mbl: opts} : (opts || {})
      this.setData({
        ['form.mbl']: params.mbl || '',
        biz: params.biz || 'vld.mbl',
        validType: params.validType || '',
        title: params.title || '验证手机号',
        desc: params.desc || '为了保证账户安全, 需验证手机号码',
        errMsg: params.mbl ? '点击获取验证码' : '输入手机号，点击获取验证码'
      })
      //
      this.data._cb = cb
      this.data._fb = fb
      this.data._chKMblfn = params.chKMblfn
      this.initKb()
      this.popup.open({
        ableMaskClick: false  // 禁止点击关闭(考虑用户输入验证码的过程可能会无意关闭)
      })
    },
    // 关闭
    close() {
      // this.show(false)
      this.data._cb = null
      this.data._fb = null
      this.data._chKMblfn = null
      this.popup.close()
      this.reset()
    },

    // 弹出框点击
    onPopuptap(e) {
      if (!this.data.validType) {
        this.close()
      }
    },
    
    onChangeValidType(e) {
      let validType = e.currentTarget.dataset.validtype
      this.setData({
        validType: validType
      })
    },

    getPhoneNumber(e) {
      let self = this
      if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
        util.toast('您已取消了授权')
      } else if (e.detail.errMsg === 'getPhoneNumber:ok') {
        console.log('biz: ', self.data.biz)
        let params = {
          type: e.type,
          biz: self.data.biz || 'vld.mbl',
          data: e.detail.encryptedData,
          iv: e.detail.iv
        }
        api.decrypt(params, rst => {
          let data = rst.data || {}
          let mbl = data.purePhoneNumber || data.phoneNumber
          this.onValidSuc({
            mbl: mbl,
            validType: 'wechat'
          })
        }, frst => {
          util.toast(frst.msg || '获取手机号失败')
        })
      } else {
        util.toast('授权失败')
      }
    },

    initKb() {
      let btnTxt
      let type = this.data.form.mbl ? 'num_sms' : 'num_mbl'
      let max = type == 'num_sms' ? 6 : 11
      this.setData({
        max: max,
        kbType: type,
      })
      if (type == 'num_mbl') {
        btnTxt = '验证码'
      } else if (type == 'num_sms') {
        btnTxt = '完成'
      }
      this.setData({
        btnTxt: btnTxt
      })
    },

    // 验证码
    checkForm(cb) {
      let ok = false
      let form = this.data.form
      let disSendSms = this.data.disSendSms
      let chKMblfn = this.data._chKMblfn
      if (!disSendSms) {
        if (!form.mbl) {
          this.setErrMsg('请输入手机号码')
        } else if (!(/^1[345789]\d{9}$/.test(form.mbl))) {
          this.setErrMsg('请输入正确的手机号码')
        } else {
          ok = true
        }
      }
      
      if (ok && typeof(chKMblfn) === 'function') {
        chKMblfn(form.mbl, (chkOk, chkMsg) => {
          if (!chkOk && chkMsg) {
            this.setErrMsg(chkMsg)
          }
          cb && cb(chkOk)
        })
      } else {
        cb && cb(ok)
      }
      return ok
    },

    setErrMsg(msg) {
      this.setData({
        errMsg: msg || ''
      })
    },

    _onKey(e) {
      let id = e.currentTarget.dataset.id
      let str = this.data.str || ''
      let kbType = this.data.kbType
      let max = this.data.max
      let param
      if (id == 'num_mbl') {
        this.sendSms()
        this.restStr()
      } else if (id == 'num_sms') {
        this.checkCode()
        this.restStr()
      } else {
        if (id == 'kb-del') {
          // 删除
          this.setData({
            str: str.substr(0, str.length - 1)
          })
          str = this.data.str
        } else {
          // 输入
          if (str.length < max) {
            this.setData({
              str: str + id
            })
          }
        }
        param = kbType == 'num_mbl' ? 'form.mbl' : 'form.smsCode'
        this.setData({
          [param]: this.data.str
        })
      }
    },

    onValidSuc(dat) {
      if (this.data._cb) {
        this.data._cb(dat)
        this.data._cb = null
        console.log('手机校验成功执行回调')
      }
      this.close()
    },

    onValidFail(msg) {
      if (this.data._fb) {
        this.data._fb(msg || '验证失败')
        this.data._fb = null
      }
      this.setErrMsg(msg || '验证失败')
    },

    // 发送验证码
    sendSms() {
      this.checkForm((ok) => {
        if (ok) {
          this.timing.countdown(60, 1000, this)()
          api.sendSms({
            mbl: this.data.form.mbl,
            smsId: 'tfc.echefu.binding'
          }, res => {
            this.data.form.smsKey = res.data
            util.toast('发送成功')
            this.setData({
              disSendSms: true,
              showTips: true,
            })
            this.initKb()
          }, err => {
            this.setErrMsg(err.msg)
          })
        }
      })
    },
    // 倒计时
    timing(count) {
      this.setData({
        codeTxt: count <= 1 ? '重新发送' : `重新发送 (${count})`
      })
      if (count <= 1) {
        this.setData({
          disSendSms: false
        })
      }
    },

    checkCode() {
      let form = this.data.form
      api.checkCode(form, res => {
        if (res.data) {
          console.log('验证码校验成功:', res.data)
          this.onValidSuc(form)
        } else {
          this.setErrMsg(res.msg || '验证码错误')
        }
      }, err => {
        this.setErrMsg(err.msg)
      })
    },
    restStr() {
      this.setData({
        str: ''
      })
    },

    reset() {
      this.setData({
        kbType: 'num_mbl',
        disSendSms: false,
        btnTxt: '完成',
        codeTxt: '获取验证码',
        errMsg: '',
        max: 11,
        str: '',
        form: {
          mbl: '',
          smsCode: '',
          smsKey: ''
        },
        _cb: null,
        _fb: null,
        _chKMblfn: null
      })
    }
  }
}))
