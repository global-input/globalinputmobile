/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState, useRef} from 'react';

import {AppState, View, Text, Platform, StyleSheet} from 'react-native';

// main////
import GlobalInputEye from '../global-input-eye';
import {HelpScreen} from '../help-screen';

import GlobalInputConnector from '../global-input-connector';

import {LoadingScreen} from '../components';
import {addStoreLoadCompletedListener, appdata} from '../store';

import {appTextConfig, menusConfig, manageFormDataTextConfig} from '../configs';

import BackupFormData from '../others/backup-data';

import {ManageFormData} from '../manage-form-data';
import DisplayUserLogin from '../display-user-login';
import OthersView from '../others/others-view';
import {ImportEncryptionKeyView} from '../import-encryption-key';
import {ImportSettingsView} from '../import-settings';
import {ManageKeysView} from '../others/manage-keys';
import {QRCodeEncryptionView} from '../qr-code-encryption';
import ManageCodeDataHistory from '../code-data-history/ManageCodeDataHistory';
const initialData = {
  render: menusConfig.loading.menu,
  codedata: '',
  message: appTextConfig.loadingMessage,
  messageTitle: '',
  isAuthorized: true,
  isAuthorizationChecked: false,
};
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#004d99',
  },
  sleepingMessage: {
    textAlign: 'center',
    fontSize: 20,
    color: '#FFFFFF',
  },
});
// export default ()=> (<View><Text>Test!</Text></View>);

export default () => {
  const sleepStartTime = useRef(null);
  const lastRender = useRef(null);
  const [compData, setCompData] = useState(initialData);

  const setRender = render => setCompData({...compData, render});
  const toSleeping = () => setRender(menusConfig.sleeping.menu);
  const toHelpScreen = () => setRender(menusConfig.help.menu);
  const toSettingsScreen = () => setRender(menusConfig.others.menu);
  const toEncryptedQRCode = () => setRender(menusConfig.encryptedQrCode.menu);
  const toExportCopyData = () => setRender(menusConfig.exportButton.menu);
  const toManageKeys = () => setRender(menusConfig.manageKeys.menu);
  const toUserLoginScreen = () => setRender(menusConfig.userLogin.menu);
  const toManageFormData = () => setRender(menusConfig.manageFormData.menu);

  const toGlobalInput = codedata => {
    setCompData({...compData, render: menusConfig.form.menu, codedata});
    appdata.addCodeDataHistoryRecord(codedata);
  };
  const toImportProtectedEncryptionKey = codedata =>
    setCompData({
      ...compData,
      render: menusConfig.protectedEncryptionKey.menu,
      codedata,
    });
  const toImportSettingsData = codedata =>
    setCompData({...compData, render: menusConfig.serviceData.menu, codedata});
  const toImportNotProtectedEncryptionKey = codedata =>
    setCompData({
      ...compData,
      render: menusConfig.notProtectedEncryptionKey.menu,
      codedata,
    });

  const toCodeDataHistory = () => setRender(menusConfig.codeDataHistory.menu);

  const logout = () => toUserLoginScreen();

  const toCameraView = () => {
    var render = menusConfig.eye.menu;
    const isAuthorized = true;
    if (Platform.OS === 'ios') {
      setRender(render);

      //Camera.checkVideoAuthorizationStatus().then(isAuthorized => {
      setCompData({
        ...compData,
        render,
        isAuthorized,
        isAuthorizationChecked: true,
      });
      //})
    } else if (Platform.OS === 'android') {
      //  PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.CAMERA, {
      //      'title': appTextConfig.permissionDialog.title,
      //      'message':  appTextConfig.permissionDialog.message,
      //    }
      //  ).then((granted) => {
      //    const isAuthorized = Platform.Version >= 23 ? granted === PermissionsAndroid.RESULTS.GRANTED : granted === true;
      setCompData({
        ...compData,
        render,
        isAuthorized,
        isAuthorizationChecked: true,
      });
      //})
    } else {
      setCompData({
        ...compData,
        render,
        isAuthorized: true,
        isAuthorizationChecked: true,
      });
    }
  };
  const onLoggedIn = () => toCameraView();

  const _handleAppStateChange = nextAppState => {
    if (nextAppState === 'inactive' || nextAppState === 'background') {
      sleepStartTime.current = new Date();
      if (!appdata.getPreserveSession()) {
        if (
          compData.render === menusConfig.form.menu ||
          compData.render === menusConfig.eye.menu
        ) {
          lastRender.current = compData.render;
          toSleeping();
        }
      }
    } else {
      if (!appdata.getLoginUserinfo()) {
        toUserLoginScreen();
      } else {
        if (sleepStartTime.current) {
          var currentTime = new Date();
          var appLoginTimeout = appdata.getAppLoginTimeout();
          if (
            currentTime.getTime() - sleepStartTime.current.getTime() >
            appLoginTimeout
          ) {
            toUserLoginScreen();
          } else {
            if (!appdata.getPreserveSession()) {
              if (compData.render === menusConfig.sleeping.menu) {
                if (lastRender.current === menusConfig.eye.menu) {
                  toCameraView();
                } else {
                  toManageFormData();
                }
              }
            }
          }
        } else {
          if (compData.render === menusConfig.sleeping.menu) {
            toManageFormData();
          }
        }
      }
    }
  };

  const buildMenuItems = () => {
    const menuItems = [
      {
        menu: menusConfig.eye.menu,
        onPress: toCameraView,
      },
      {
        menu: menusConfig.manageFormData.menu,
        onPress: toManageFormData,
      },
      {
        menu: menusConfig.manageKeys.menu,
        onPress: toManageKeys,
      },

      {
        menu: menusConfig.others.menu,
        onPress: toSettingsScreen,
      },
    ];

    const codeDataHistory = appdata.getHistoryData();
    if (codeDataHistory && codeDataHistory.length > 0) {
      menuItems.unshift({
        menu: menusConfig.codeDataHistory.menu,
        onPress: toCodeDataHistory,
      });
    }
    return menuItems;
  };

  useEffect(() => {
    const appStateSubscription = AppState.addEventListener(
      'change',
      _handleAppStateChange,
    );
    const removeCompletedListener = addStoreLoadCompletedListener(() => {
      setRender(menusConfig.userLogin.menu);
      ////dev_login////
    });
    return () => {
      appStateSubscription.remove();
      removeCompletedListener();
    };
  }, []);

  var menuItems = buildMenuItems();

  switch (compData.render) {
    ////dev_case_render////
    case menusConfig.loading.menu:
      return <LoadingScreen message={compData.message} />;
    case menusConfig.userLogin.menu:
      return <DisplayUserLogin onLoggedIn={onLoggedIn} />;
    case menusConfig.eye.menu:
      return (
        <GlobalInputEye
          menuItems={menuItems}
          isAuthorized={compData.isAuthorized}
          isAuthorizationChecked={compData.isAuthorizationChecked}
          toGlobalInput={toGlobalInput}
          toImportProtectedEncryptionKey={toImportProtectedEncryptionKey}
          toImportNotProtectedEncryptionKey={toImportNotProtectedEncryptionKey}
          toImportSettingsData={toImportSettingsData}
          toHelpScreen={toHelpScreen}
        />
      );
    case menusConfig.help.menu:
      return <HelpScreen menuItems={menuItems} />;
    case menusConfig.others.menu:
      return (
        <OthersView
          menuItems={menuItems}
          logout={logout}
          encryptedQRCodeSelected={toEncryptedQRCode}
        />
      );
    case menusConfig.form.menu:
      return (
        <GlobalInputConnector
          menuItems={menuItems}
          codedata={compData.codedata}
          toCameraView={toCameraView}
        />
      );
    case menusConfig.protectedEncryptionKey.menu:
      return (
        <ImportEncryptionKeyView
          menuItems={menuItems}
          codedata={compData.codedata}
          toCameraView={toCameraView}
        />
      );
    case menusConfig.serviceData.menu:
      return (
        <ImportSettingsView
          menuItems={menuItems}
          codedata={compData.codedata}
          toCameraView={toCameraView}
        />
      );

    case menusConfig.notProtectedEncryptionKey.menu:
      return (
        <ImportEncryptionKeyView
          menuItems={menuItems}
          decryptedEncryptionKey={compData.codedata}
          toCameraView={toCameraView}
        />
      );
    case menusConfig.sleeping.menu:
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.sleepingMessage}>
            {appTextConfig.sleepingMessage}
          </Text>
        </View>
      );

    case menusConfig.manageFormData.menu:
      return (
        <ManageFormData
          title={manageFormDataTextConfig.title}
          formDataStorage={appdata}
          menuItems={menuItems}
        />
      );

    case menusConfig.exportButton.menu:
      return <BackupFormData menuItems={menuItems} />;

    case menusConfig.manageKeys.menu:
      return <ManageKeysView menuItems={menuItems} />;

    case menusConfig.encryptedQrCode.menu:
      return <QRCodeEncryptionView menuItems={menuItems} />;
    case menusConfig.codeDataHistory.menu:
      return (
        <ManageCodeDataHistory
          menuItems={menuItems}
          onCodeSelected={toGlobalInput}
        />
      );
    default:
      return <LoadingScreen message={compData.message} />;
  }
};
