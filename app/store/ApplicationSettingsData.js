import * as globalInputMessage from '../global-input-message';
import {globalInputSettings} from './reducers/globalInputSettings';
import * as userSettings from './reducers/userSettings';
import * as domainFormMappings from './reducers/domainFormMappings';
import * as generalUtil from './reducers/generalUtil';
import FormDataUtil from './FormDataUtil';
var formDataUtil = new FormDataUtil();

const safeDecrypt = function (content, encryptionKey) {
  try {
    return globalInputMessage.decrypt(content, encryptionKey);
  } catch (error) {
    return null;
  }
};
const appInstance = {
  id: null,
  key: 'r0sCypW37cgEs37XKB8y',
};
function memEncrypt(data) {
  return globalInputMessage.encrypt(data, appInstance.key);
}
function memDecrypt(data) {
  return globalInputMessage.decrypt(data, appInstance.key);
}

export default class ApplicationSettingsData {
  constructor(store) {
    this.store = store;
    this.encryptionKeyPrefix = 'LrHXyPx6NW';
    this.encryptionKeySuffix = 'rzjjTYkEwd';
    this.passwordProtectionSuffix = 'kE4yPZrJlKCEKGpTPctVzwU';

    this.backupKeySuffix = 'xQV';
    this.encryptionKeyAppendedPart = 'Ekv';
    this.contetKeySuffix = 'eJx';
    this.encryptedWithEncryptionKeyCodeIdentifier = 'P1';

    this.encryptionKeyIdentifier = 'P2';
    this.protectedKeyIdentifier = 'P3C7h1';
    this.JSONIdentifier = 'J';
    this.encryptionKeyContentType = 'master';

    this.encryptionKeyExportedAsTextIdentifier = 'XFyuHTV74za2n6gh';
    this.protectEncryptionKeyExportedAsTextIdentifier = 'HdSMqCszICFT6VOY';

    this.formDataIdentifier = 'BTtHfSSdkQbEjKAD';
  }
  encryptContent(content) {
    var activeEncryptionKey = this.getDecryptedActiveEncryptionKey();
    return this.encryptContentWithKey(content, activeEncryptionKey);
  }
  encryptContentWithKey(content, encryptionKey) {
    if (content && content.length) {
      return globalInputMessage.encrypt(
        content,
        encryptionKey + this.contetKeySuffix,
      );
    } else {
      return '';
    }
  }
  decryptContent(content) {
    if (content && content.length) {
      var activeEncryptionKey = this.getDecryptedActiveEncryptionKey();
      return safeDecrypt(content, activeEncryptionKey + this.contetKeySuffix);
    } else {
      return '';
    }
  }
  encryptBackup(content) {
    var activeEncryptionKey = this.getDecryptedActiveEncryptionKey();
    return globalInputMessage.encrypt(
      content,
      activeEncryptionKey + this.backupKeySuffix,
    );
  }

  isActiveEncryptionKeyEncryptedMessage(codedata) {
    return (
      codedata &&
      codedata.startsWith &&
      codedata.startsWith(this.encryptedWithEncryptionKeyCodeIdentifier)
    );
  }
  isMasterEncryptionKeyCodedata(codedata) {
    return (
      codedata &&
      codedata.startsWith &&
      codedata.startsWith(this.encryptionKeyIdentifier)
    );
  }
  isProtectedMasterEncryptionKey(codedata) {
    return (
      codedata &&
      codedata.startsWith &&
      codedata.startsWith(this.protectedKeyIdentifier)
    );
  }

  decryptEncryptionKeyText(content) {
    var content = content.slice(
      this.encryptionKeyExportedAsTextIdentifier.length,
    );
    return this.decryptExportedEncryptionKey(content, null);
  }
  decryptEncryptionKey(encryptionKeyitem) {
    const userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      this._getLoginUserInfo().password,
    );
    return safeDecrypt(encryptionKeyitem.encryptionKey, userEncryptionKey);
  }

  encryptWithAnEncryptionKey(secretMessage, encryptionKey) {
    const decryptedEncryptionKey = this.decryptEncryptionKey(encryptionKey);
    if (decryptedEncryptionKey) {
      var prefix = globalInputMessage.generateRandomString(3);
      var suffix = globalInputMessage.generateRandomString(7);
      var encryptedMessage = globalInputMessage.encrypt(
        prefix + secretMessage + suffix,
        decryptedEncryptionKey + this.encryptionKeyAppendedPart,
      );
      return this.encryptedWithEncryptionKeyCodeIdentifier + encryptedMessage;
    }
  }
  decryptCodeDataWithAnyEncryptionKey(encryptedMessage) {
    var encrypted = encryptedMessage.substring(
      this.encryptedWithEncryptionKeyCodeIdentifier.length,
    );
    var decrypted = this.decryptContentWithAnyEcryptionKey(
      encrypted,
      this.encryptionKeyAppendedPart,
    );
    if (decrypted) {
      if (decrypted.length > 10) {
        var withoutPRefix = decrypted.substring(3);
        return withoutPRefix.substring(0, withoutPRefix.length - 7);
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  decryptContentWithAnyEcryptionKey(encryptedContent, encryptionKeySuffix) {
    var activeEncryptionKey = this.getDecryptedActiveEncryptionKey();
    var decryptedContent = safeDecrypt(
      encryptedContent,
      activeEncryptionKey + encryptionKeySuffix,
    );
    if (decryptedContent) {
      return decryptedContent;
    }
    var encryptionKeyList = this.getEncryptionKeyList();
    var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      this._getLoginUserInfo().password,
    );
    for (var i = 0; i < encryptionKeyList.length; i++) {
      try {
        var decryptedEncryptionKey = safeDecrypt(
          encryptionKeyList[i].encryptionKey,
          userEncryptionKey,
        );
        if (decryptedEncryptionKey === activeEncryptionKey) {
          continue;
        }
        if (decryptedEncryptionKey) {
          decryptedContent = safeDecrypt(
            encryptedContent,
            decryptedEncryptionKey + encryptionKeySuffix,
          );
          if (decryptedContent) {
            return decryptedContent;
          }
        } else {
          console.log(
            'failed to decryp the key:' + encryptionKeyList[i].encryptionKey,
            userEncryptionKey,
          );
        }
      } catch (error) {
        console.log('failed to decryp the content with none-active key');
      }
    }
    return null;
  }

  setApiKey(apikey) {
    this.store.dispatch(globalInputSettings.actions.apikey(apikey));
  }
  setSecurityGroup(securityGroup) {
    this.store.dispatch(
      globalInputSettings.actions.securityGroup(securityGroup),
    );
  }
  setCodeAES(codeAES) {
    this.store.dispatch(globalInputSettings.actions.codeAES(codeAES));
  }
  setClient(client) {
    this.store.dispatch(globalInputSettings.actions.client(client));
  }
  setAppLoginTimeout(appLoginTimeout) {
    this.store.dispatch(
      globalInputSettings.actions.appLoginTimeout(appLoginTimeout),
    );
  }
  setPreserveSession(preserveSession) {
    this.store.dispatch(
      globalInputSettings.actions.preserveSession(preserveSession),
    );
  }
  setProxyURL(proxyURL) {
    this.store.dispatch(globalInputSettings.actions.proxyURL(proxyURL));
  }
  getProxyURL() {
    return this.store.getState().globalInputSettings.proxyURL;
  }

  getApikey() {
    return this.store.getState().globalInputSettings.apikey;
  }
  getCodeAES() {
    return this.store.getState().globalInputSettings.codeAES;
  }
  getSecurityGroup() {
    return this.store.getState().globalInputSettings.securityGroup;
  }
  getAppLoginTimeout() {
    var appLoginTimeout =
      this.store.getState().globalInputSettings.appLoginTimeout;
    if (!appLoginTimeout) {
      appLoginTimeout = 30000;
      this.setAppLoginTimeout(appLoginTimeout);
    }
    return appLoginTimeout;
  }
  getPreserveSession() {
    return this.store.getState().globalInputSettings.preserveSession;
  }

  _getClient() {
    return this.store.getState().globalInputSettings.client;
  }
  getClient() {
    var client = this._getClient();
    if (!client || client.length < 10) {
      client = globalInputMessage.generateRandomString(17);
      this.setClient(client);
    }
    return client;
  }

  getShowWelcomePage() {
    return userSettings.getShowWelcomePage(this.store);
  }
  setShowWelcomePage(showWelcomePage) {
    userSettings.setShowWelcomePage(this.store, showWelcomePage);
  }
  updateFormData(formId, formData) {
    if (formId && formData && formData.id) {
      userSettings.updateFormData(this.store, formId, formData);
      domainFormMappings.updateDomains({formData, formId, store: this.store});
    } else {
      console.log('Could not save empty data or the ones without id');
    }
  }
  createFormData(formData) {
    if (formData && formData.id) {
      userSettings.createFormData(this.store, formData);
      domainFormMappings.saveDomains({formData, store: this.store});
    } else {
      console.log('Could not save empty data or the ones without id');
    }
  }
  mergeFormData(formData) {
    if (formData && formData.id) {
      userSettings.mergeFormData(this.store, formData);
      domainFormMappings.mergeFormData({formData, store: this.store});
    } else {
      console.log('Could not merge empty data or the ones without id');
    }
  }
  deleteFormData(formData) {
    if (formData && formData.id) {
      userSettings.deleteFormData(this.store, formData);
      domainFormMappings.deleteFormData({formData, store: this.store});
    } else {
      console.log('Could not delete empty data or the ones without id');
    }
  }

  clearAllForms() {
    userSettings.clearAllForms(this.store);
    domainFormMappings.deleteAll({store: this.store});
  }
  resetApp() {
    userSettings.resetApp(this.store);
  }
  mergeFormDataList(formDataList) {
    userSettings.mergeFormDataList(this.store, formDataList);
    domainFormMappings.mergeFormDataList({formDataList, store: this.store});
  }

  getFormContentById(formId) {
    return userSettings.getFormContentById(this.store, formId);
  }
  searchFormDataById(formId) {
    return userSettings.searchFormDataById(this.store, formId.toLowerCase());
  }

  getSavedFormContent() {
    return userSettings.getAllForms(this.store);
  }
  getAllLabels() {
    return formDataUtil.getAllLabelsFromFormDataList(
      userSettings.getAllForms(this.store),
    );
  }
  hasFormContent() {
    var savedContent = userSettings.getAllForms(this.store);
    return savedContent && savedContent.length;
  }
  cloneFormData(formData) {
    if (!formData) {
      return formData;
    }
    var newFormData = Object.assign({}, formData);
    if (formData.fields) {
      newFormData.fields = [];
      for (var i = 0; i < formData.fields.length; i++) {
        newFormData.fields.push(Object.assign({}, formData.fields[i]));
      }
    }
    return newFormData;
  }

  findEncryptionKeyByDecryptedValue(decryptedKey) {
    var encryptionKeyList = this.getEncryptionKeyList();
    var matchedKeyItem = null;
    var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      this._getLoginUserInfo().password,
    );
    encryptionKeyList.forEach(ekey => {
      var decryptedEncryptionKey = safeDecrypt(
        ekey.encryptionKey,
        userEncryptionKey,
      );
      if (decryptedEncryptionKey === decryptedKey) {
        matchedKeyItem = ekey;
      }
    });
    return matchedKeyItem;
  }

  getActiveEncryptionKeyItem() {
    var activeEncryptionKey = this._getActiveEncryptionKey();
    var encryptionKeyList = this.getEncryptionKeyList();
    for (var i = 0; i < encryptionKeyList.length; i++) {
      if (encryptionKeyList[i].encryptionKey === activeEncryptionKey) {
        return encryptionKeyList[i];
      }
    }
    return {
      encryptionKey: activeEncryptionKey,
      name: 'App',
    };
  }
  getEncryptionKeyList() {
    var activeEncryptionKey = this._getActiveEncryptionKey();

    var encryptionKeyList = userSettings.getEncryptionKeyList(this.store);

    if (!encryptionKeyList.length) {
      var encryptionKey = this._importEncryptedNewKey(
        'This Device',
        activeEncryptionKey,
      );
      encryptionKeyList.push(encryptionKey);
    }
    return encryptionKeyList;
  }
  isEncryptionKeyIsActive(encryptionKey) {
    var activeEncryptionKey = this._getActiveEncryptionKey();
    return activeEncryptionKey === encryptionKey.encryptionKey;
  }

  _getActiveEncryptionKey() {
    var activeEncryptionKey = userSettings.getActiveEncryptionKey(this.store);
    if (activeEncryptionKey) {
      return activeEncryptionKey;
    } else {
      /*
          In the old version the variable name is masterEncryptionKey.
          In the new version the variable name is activeEncryptionKey;
      */
      return userSettings.getMasterEncryptionKey(this.store);
    }
  }
  _getLoginUserInfo() {
    return this.loginUserinfo;
  }
  _loginUserInfoSetActiveEncrytionKey(activeEncryptionKey) {
    this._getLoginUserInfo().activeEncryptionKey = activeEncryptionKey;
  }
  _getActiveEncryptionKeyFromLoginUserInfo(loginUserInfo) {
    if (!loginUserInfo) {
      return null;
    }
    if (loginUserInfo.activeEncryptionKey) {
      return loginUserInfo.activeEncryptionKey;
    } else {
      //try the old version;
      return loginUserInfo.masterEncryptionKey;
    }
  }
  getDecryptedActiveEncryptionKey() {
    var activeEncruptionKey = this._getActiveEncryptionKeyFromLoginUserInfo(
      this._getLoginUserInfo(),
    );
    if (activeEncruptionKey) {
      return activeEncruptionKey;
    } else {
      return this._getActiveEncryptionKey();
    }
  }

  deleteEncryptionKeyItem(encryptionItemToDelete) {
    userSettings.deleteEncryptionItem(this.store, encryptionItemToDelete);
  }
  updateEncryptionKey(encryptionItem) {
    userSettings.updateEncryptionItem(this.store, encryptionItem);
  }

  importNewKey(name, encryptionKey) {
    var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      this._getLoginUserInfo().password,
    );
    var encryptedEncryptionKey = globalInputMessage.encrypt(
      encryptionKey,
      userEncryptionKey,
    );
    return this._importEncryptedNewKey(name, encryptedEncryptionKey);
  }
  _importEncryptedNewKey(name, encryptedEncryptionKey) {
    var encryptionItem = {
      createdAt: new Date(),
      encryptionKey: encryptedEncryptionKey,
      name,
    };
    this._addEncryptionItem(encryptionItem);
    return encryptionItem;
  }
  decryptPasswordEncryptedEncryptionKeyText(content, protectionPassword) {
    var content = content.slice(
      this.protectEncryptionKeyExportedAsTextIdentifier.length,
    );
    return this.decryptExportedEncryptionKey(content, protectionPassword);
  }

  decryptFormDataText(content) {
    try {
      var content = content.slice(this.formDataIdentifier.length);
      var activeEncryptionKey = this.getDecryptedActiveEncryptionKey();
      var globalInputData = safeDecrypt(
        content,
        activeEncryptionKey + this.backupKeySuffix,
      );
      if (!globalInputData) {
        console.log('Failed to decrypt the backup');
        return null;
      }
      globalInputData = JSON.parse(globalInputData);
      if (!globalInputData.forms || !globalInputData.forms.length) {
        console.log('data format error');
        return null;
      }
      return globalInputData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  exportFormContentAsText() {
    var forms = this.getSavedFormContent();
    if (forms && forms.length) {
      const allDomainMappingRecords =
        domainFormMappings.getAllDomainMappingRecords(this.store);
      generalUtil.populateDomainsForAllForms(allDomainMappingRecords, forms);
      var globalInputData = {
        forms,
        randomContent: globalInputMessage.generateRandomString(8),
      };
      var encryptedContent = this.encryptBackup(
        JSON.stringify(globalInputData),
      );
      return this.formDataIdentifier + encryptedContent;
    } else {
      return '';
    }
  }

  isPasswordEncryptedEncryptionKeyText(content) {
    if (!content) {
      return false;
    }
    return (
      content.startsWith &&
      content.startsWith(this.protectEncryptionKeyExportedAsTextIdentifier)
    );
  }
  isEncryptionKeyText(content) {
    return (
      content.startsWith &&
      content.startsWith(this.encryptionKeyExportedAsTextIdentifier)
    );
  }
  isFormDataText(content) {
    if (!content) {
      return false;
    }
    return content.startsWith && content.startsWith(this.formDataIdentifier);
  }

  exportEncryptionKeyItemWithPassword(encryptionKeyitem, protectionPassword) {
    var encryptionKeyDecrypted = this.decryptEncryptionKey(encryptionKeyitem);
    if (!encryptionKeyDecrypted) {
      return null;
    }
    return this.exportEncryptionKeyWithPassword(
      encryptionKeyDecrypted,
      protectionPassword,
    );
  }
  exportEncryptionKeyWithPassword(
    decryptedEncryptionKeyValue,
    protectionPassword,
  ) {
    var data = {
      random: globalInputMessage.generateRandomString(3),
      key: decryptedEncryptionKeyValue,
      type: this.encryptionKeyContentType,
    };
    var encryptionKey = this.passwordProtectionSuffix;
    if (protectionPassword) {
      encryptionKey = protectionPassword + encryptionKey;
    }
    var stringvalue = this.JSONIdentifier + JSON.stringify(data);
    var encrypted = globalInputMessage.encrypt(stringvalue, encryptionKey);

    if (protectionPassword) {
      return this.protectedKeyIdentifier + encrypted;
    } else {
      return this.encryptionKeyIdentifier + encrypted;
    }
  }
  exportEncryptionKeyItemAsText(encryptionKeyitem, protectionPassword) {
    var encryptionKeyDecrypted = this.decryptEncryptionKey(encryptionKeyitem);
    if (!encryptionKeyDecrypted) {
      return null;
    }
    return this.exportEncryptionKeyValueAsText(
      encryptionKeyDecrypted,
      protectionPassword,
    );
  }
  exportEncryptionKeyValueAsText(
    decryptedEncryptionKeyValue,
    protectionPassword,
  ) {
    var keyEncrypted = this.exportEncryptionKeyWithPassword(
      decryptedEncryptionKeyValue,
      protectionPassword,
    );
    if (protectionPassword) {
      return this.protectEncryptionKeyExportedAsTextIdentifier + keyEncrypted;
    } else {
      return this.encryptionKeyExportedAsTextIdentifier + keyEncrypted;
    }
  }

  decryptExportedEncryptionKey(codedata, protectionPassword) {
    try {
      var encIdentifier = this.encryptionKeyIdentifier;
      var encryptionKey = this.passwordProtectionSuffix;

      if (protectionPassword) {
        encIdentifier = this.protectedKeyIdentifier;
        encryptionKey = protectionPassword + encryptionKey;
      }
      if (!codedata.startsWith(encIdentifier)) {
        return null;
      }
      var encrypted = codedata.substring(encIdentifier.length);
      var decrypted = safeDecrypt(encrypted, encryptionKey);
      if (!decrypted) {
        return null;
      }

      if (!decrypted.startsWith(this.JSONIdentifier)) {
        return null;
      }
      var keystring = decrypted.substring(this.JSONIdentifier.length);

      var data = JSON.parse(keystring);
      if (data.type === this.encryptionKeyContentType) {
        return data.key;
      } else {
        return null;
      }
    } catch (error) {
      console.log('failed to parse the json:' + error);
      return null;
    }
  }

  _addEncryptionItem(encryptionItem) {
    userSettings.addEncryptionItem(this.store, encryptionItem);
  }
  _appLoginContent(
    appLoginContent,
    activeEncryptionKey,
    encryptionKeyList,
    savedFormContent,
  ) {
    userSettings.appLoginContent(
      this.store,
      appLoginContent,
      activeEncryptionKey,
      encryptionKeyList,
      savedFormContent,
    );
  }

  activateEncryptionKey(encryptionKeyitem) {
    if (!this._getLoginUserInfo()) {
      console.log('The user has not logged in');
      return;
    }
    var encryptionKeyDecrypted = this.decryptEncryptionKey(encryptionKeyitem);
    if (!encryptionKeyDecrypted) {
      return false;
    }
    if (encryptionKeyDecrypted === this.getDecryptedActiveEncryptionKey()) {
      console.log('the key is identical to the current one');
      return;
    }
    var savedFormContent = this.getSavedFormContent();
    savedFormContent.forEach(form => {
      form.fields.forEach(f => {
        var value = this.decryptContent(f.value);
        f.value = this.encryptContentWithKey(value, encryptionKeyDecrypted);
      });
    });

    this._loginUserInfoSetActiveEncrytionKey(encryptionKeyDecrypted);
    var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      this._getLoginUserInfo().password,
    );
    var userinfoString = JSON.stringify(this._getLoginUserInfo());
    var appLoginContent = globalInputMessage.encrypt(
      userinfoString,
      userEncryptionKey,
    );
    this._appLoginContent(
      appLoginContent,
      encryptionKeyitem.encryptionKey,
      null,
      savedFormContent,
    );
  }

  _isActiveEncryptionKeyEncrypted() {
    var activeEncruptionKey = this.getDecryptedActiveEncryptionKey();
    return (
      activeEncruptionKey &&
      activeEncruptionKey.startsWith('U2Fsd') &&
      activeEncruptionKey.length > 25
    );
  }
  isFormDataPasswordProtected() {
    if (this.getAppLoginContent()) {
      return true;
    } else {
      return this._isActiveEncryptionKeyEncrypted();
    }
  }

  getAppLoginContent() {
    var ret = userSettings.getAppLoginContent(this.store);
    if (ret) {
      return ret;
    } else {
      /*
    In the old version, the variable name is appLoginPassword
    In the new version, the variable name is appLoginContent
      */
      return userSettings.getAppLoginPassword(this.store);
    }
  }

  buildUserEncryptionKeyFromPassword(password) {
    return this.encryptionKeyPrefix + password + this.encryptionKeySuffix;
  }
  getLoginUserinfo() {
    return this.loginUserinfo;
  }

  decryptedWithPassword(encryptedContent) {
    var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      this.getLoginUserinfo().password,
    );
    return safeDecrypt(encryptedContent, userEncryptionKey);
  }
  _setLoginUserInfo(loginUserinfo) {
    this.loginUserinfo = loginUserinfo;
  }
  _createInitialLoginUserInfo(password, activeEncryptionKey) {
    return {
      application: 'GlobalInput',
      createdAt: new Date().getTime(),
      password,
      activeEncryptionKey,
    };
  }

  changePassword(originalPassword, newPassword) {
    if (!originalPassword) {
      return false;
    }
    if (!newPassword) {
      return false;
    }
    var loginUserinfo = this._getLoginUserInfo();

    if (!loginUserinfo) {
      return false;
    }
    if (loginUserinfo.password !== originalPassword) {
      return false;
    }
    if (loginUserinfo.password === newPassword) {
      return false;
    }
    if (this.getAppLoginContent()) {
      try {
        var originalUserEncryptionKey =
          this.buildUserEncryptionKeyFromPassword(originalPassword);
        var newUserEncryptionKey =
          this.buildUserEncryptionKeyFromPassword(newPassword);

        var activeEncruyptionKeyDecrypted =
          this.getDecryptedActiveEncryptionKey();
        var encryptedActiveEncryptionKey = globalInputMessage.encrypt(
          activeEncruyptionKeyDecrypted,
          newUserEncryptionKey,
        );
        var encryptionKeyList = this.getEncryptionKeyList();
        if (encryptionKeyList.length) {
          encryptionKeyList.forEach(ekey => {
            var decryptedEncryptionKey = safeDecrypt(
              ekey.encryptionKey,
              originalUserEncryptionKey,
            );
            if (decryptedEncryptionKey) {
              if (decryptedEncryptionKey === activeEncruyptionKeyDecrypted) {
                ekey.encryptionKey = encryptedActiveEncryptionKey;
              } else {
                ekey.encryptionKey = globalInputMessage.encrypt(
                  decryptedEncryptionKey,
                  newUserEncryptionKey,
                );
              }
            }
            return ekey;
          });
        }
        loginUserinfo.password = newPassword;
        loginUserinfo.createdAt = new Date().getTime();
        this._setLoginUserInfo(loginUserinfo);
        var userinfoString = JSON.stringify(loginUserinfo);
        var appLoginContent = globalInputMessage.encrypt(
          userinfoString,
          newUserEncryptionKey,
        );
        this._appLoginContent(
          appLoginContent,
          encryptedActiveEncryptionKey,
          encryptionKeyList,
          null,
        );
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    } else {
      return false;
    }
  }

  userAppLogin(password, rememberPassword) {
    if (!password) {
      console.log('password is empty');
      return false;
    }
    var appLoginContent = this.getAppLoginContent();
    if (appLoginContent) {
      try {
        var userEncryptionKey =
          this.buildUserEncryptionKeyFromPassword(password);
        var userinfoString = safeDecrypt(appLoginContent, userEncryptionKey);
        if (!userinfoString) {
          console.log('userinfoString is empty');
          return false;
        }
        var loginUserinfo = JSON.parse(userinfoString);
        if (
          loginUserinfo.application !== 'GlobalInput' ||
          loginUserinfo.password !== password
        ) {
          console.log('application login is not GlobalInput');
          return false;
        }
        if (this._getActiveEncryptionKeyFromLoginUserInfo(loginUserinfo)) {
          this._setLoginUserInfo(loginUserinfo);
          if (rememberPassword) {
            const encodedPassword = memEncrypt(password);
            userSettings.rememberPassword(this.store, encodedPassword);
          } else {
            userSettings.rememberPassword(this.store, '');
          }
          return true;
        } else {
          //old version, there is appLoginContent that does not contains the enckey.
          return this._oldVersionRecoverEncryptionKeyInAppLoginContent(
            loginUserinfo,
            userEncryptionKey,
          );
        }
      } catch (error) {
        console.log(error);
        return false;
      }
    } else if (this._isActiveEncryptionKeyEncrypted()) {
      //trying to decrypt the active encryption key.
      var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(password);
      //appLoginContent is missing, just create one
      var loginUserinfo = this._createInitialLoginUserInfo(password, null);
      return this._oldVersionRecoverEncryptionKeyInAppLoginContent(
        loginUserinfo,
        userEncryptionKey,
      );
    } else {
      console.log('Needs to set up password first');
      return false;
    }
  }

  /*
   In the old version, encryption key is not stored inside appLoginContent.
      So when app realized this, it shouild try to fix by getting it from _getActiveEncryptionKey()
      and stored it into appLoginContent.
      //this should be only called from user login.
  */

  _oldVersionRecoverEncryptionKeyInAppLoginContent(
    loginUserinfo,
    userEncryptionKey,
  ) {
    //old version, there is a appLoginContent that does not contains the enckey.
    var activeEncryptionKey = this._getActiveEncryptionKey();
    loginUserinfo.activeEncryptionKey = safeDecrypt(
      activeEncryptionKey,
      userEncryptionKey,
    );
    if (loginUserinfo.activeEncryptionKey) {
      this._setLoginUserInfo(loginUserinfo);
      this._updateAppLoginContentEncrytionListAndForm(loginUserinfo);
      return true;
    } else {
      console.log(
        'Failed to login because it failed to decrupt the active encryption key',
      );
      return false;
    }
  }
  getRememberedPassword() {
    const encodedPassword = userSettings.getRememberedPassword(this.store);
    if (encodedPassword) {
      return memDecrypt(encodedPassword);
    } else {
      return null;
    }
  }
  addCodeDataHistoryRecord(codeData) {
    const historyData = userSettings.getHistoryData(this.store);
    const newRecord = {
      id: codeData.session,
      time: new Date().getTime(),
      codeData,
    };

    const updatedHistoryData = historyData.filter(
      record => record.id !== newRecord.id,
    );
    if (updatedHistoryData.length > 10) {
      updatedHistoryData.pop();
    }
    updatedHistoryData.unshift(newRecord);
    userSettings.setHistoryData(this.store, updatedHistoryData);
  }
  getHistoryData() {
    return userSettings.getHistoryData(this.store);
  }
  removeCodeDataFromHistory(codeData) {
    const historyData = userSettings.getHistoryData(this.store);
    const updatedHistoryData = historyData.filter(
      record => record.id !== codeData.session,
    );
    userSettings.setHistoryData(this.store, updatedHistoryData);
  }

  userAppLoginSetup(password, remember) {
    if (!password) {
      console.log('password is empty');
      return false;
    }
    var appLoginContent = this.getAppLoginContent();
    if (appLoginContent) {
      console.log('appLogin is already set up');
      return false;
    }
    var activeEncryptionKey = this._getActiveEncryptionKey();
    var loginUserinfo = this._createInitialLoginUserInfo(
      password,
      activeEncryptionKey,
    );

    this._setLoginUserInfo(loginUserinfo);
    this._updateAppLoginContentEncrytionListAndForm(loginUserinfo);
    if (remember) {
      const encodedPassword = memEncrypt(password);
      console.log('encodedPassword:' + encodedPassword);
      userSettings.rememberPassword(this.store, encodedPassword);
    }
    return true;
  }
  _updateAppLoginContentEncrytionListAndForm(
    loginUserinfo,
    encryptionKeyList,
    savedFormContent,
  ) {
    var userEncryptionKey = this.buildUserEncryptionKeyFromPassword(
      loginUserinfo.password,
    );
    var userinfoString = JSON.stringify(loginUserinfo);
    var appLoginContent = globalInputMessage.encrypt(
      userinfoString,
      userEncryptionKey,
    );
    var encryptedActiveEncryptionKey = globalInputMessage.encrypt(
      loginUserinfo.activeEncryptionKey,
      userEncryptionKey,
    );
    userSettings.appLoginContent(
      this.store,
      appLoginContent,
      encryptedActiveEncryptionKey,
      encryptionKeyList,
      savedFormContent,
    );
  }
}
