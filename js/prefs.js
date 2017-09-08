const fs = require('fs')
const path = require('path')
const { app } = require('electron')
const os = require("os");

const pkg = require('../package.json')
const util = require('./utils.js') // for Object.equals

// TODO pref specifics shouldnt be in this module.
const prefFile = path.join(app.getPath('userData'), 'characterizer-preferences.json')

const defaultPrefs = {
  version: pkg.version,
}

let prefs

const load = () => {
  try {
    // load existing prefs
    // console.log("READING FROM DISK")
    prefs = JSON.parse(fs.readFileSync(prefFile))
  } catch (e) {
    prefs = defaultPrefs
    try {
      savePrefs(prefs)
    } catch (e) {
      //console.log(e)
    }
  }
}

const savePrefs = (newPref) => {
  // console.log('SAVEPREFS')
  if (!newPref) return
  if (Object.equals(newPref,prefs)) {
    // console.log("IM THE SAME!!!!")
  } else {
    prefs = newPref
    // console.log("SAVING TO DISK")
    fs.writeFileSync(prefFile, JSON.stringify(newPref, null, 2))
  }
}

const set = (keyPath, value, sync) => {
  // console.log('SETTING')
  const keys = keyPath.split(/\./)
  let obj = prefs
  while (keys.length > 1) {
    const key = keys.shift()
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = {}
    }
    obj = obj[key]
  }
  let keyProp = keys.shift()
  let prevValue = obj[keyProp]
  if (Object.equals(prevValue,value)) {
    //console.log("IM THE SAME!!!!")
  } else {
    obj[keyProp] = value
    //console.log("SAVING TO DISK")
    //console.log(prefs)
    if (sync) {
      fs.writeFileSync(prefFile, JSON.stringify(prefs, null, 2))
    } else {
      fs.writeFile(prefFile, JSON.stringify(prefs, null, 2), (err) => {
        // console.log("SAVED ASYNC")
      })
    }
  }
}

const getPrefs = (from) => {
  // console.log("GETTING PREFS!!!", from)
  return prefs
}

const migrate = () => {
  prefs = Object.assign({}, defaultPrefs, prefs)
  prefs.version = defaultPrefs.version
}

const init = () => {
  //console.log("I AM INIT")
  load()
  if (prefs.version !== defaultPrefs.version) {
    migrate()
    savePrefs(prefs)
  }
}

init()

module.exports = {
  savePrefs,
  getPrefs,
  set
}
