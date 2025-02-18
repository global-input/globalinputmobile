import React, {Component} from 'react';
import {Text, View, Linking} from 'react-native';
import {styles, stylesData} from './styles';
import {formDataUtil} from '../../store';

export default class DisplayContent extends Component {
  MAX_ARRAY_LENGTH = 500;
  MAX_URL_LENGTH = 500;
  MAX_CONTENT_LENGTH = 1000;

  isValidContent(content, maxLength = this.MAX_CONTENT_LENGTH) {
    if (!content) {
      return false;
    }
    if (content.length < maxLength) {
      return true;
    } else {
      return false;
    }
  }

  isValidURL(url) {
    if (!url) {
      return false;
    }
    if (url.length > this.MAX_URL_LENGTH) {
      console.warn('URL is too long');
      return false;
    }
    if (
      url.startsWith &&
      (url.startsWith('http://') || url.startsWith('https://'))
    ) {
      return true;
    } else {
      return null;
    }
  }
  renderTextContent(content, textStyle, key) {
    if (typeof key === 'undefined') {
      if (typeof content === 'object') {
        return <Text style={textStyle}>{this.renderItem(content)}</Text>;
      } else {
        return <Text style={textStyle}>{content}</Text>;
      }
    } else if (typeof content === 'object') {
      return (
        <Text style={textStyle} key={key}>
          {this.renderItem(content)}
        </Text>
      );
    } else {
      return (
        <Text style={textStyle} key={key}>
          {content}
        </Text>
      );
    }
  }
  renderLinkTextContent(content, url, textStyle, key) {
    if (!this.isValidURL(url)) {
      return this.renderTextContent(content, textStyle, key);
    } else if (typeof key === 'undefined') {
      if (typeof content === 'object') {
        return (
          <Text
            style={textStyle}
            onPress={() => {
              Linking.openURL(url);
            }}>
            {this.renderItem(content)}
          </Text>
        );
      } else {
        return (
          <Text
            style={textStyle}
            onPress={() => {
              Linking.openURL(url);
            }}>
            {content}
          </Text>
        );
      }
    } else if (typeof content === 'object') {
      return (
        <Text
          style={textStyle}
          key={key}
          onPress={() => {
            Linking.openURL(url);
          }}>
          {this.renderItem(content)}
        </Text>
      );
    } else {
      return (
        <Text
          style={textStyle}
          key={key}
          onPress={() => {
            Linking.openURL(url);
          }}>
          {content}
        </Text>
      );
    }
  }
  renderViewContent(content, viewStyle, key) {
    if (typeof key === 'undefined') {
      if (typeof content === 'object') {
        return <View style={viewStyle}>{this.renderItem(content)}</View>;
      } else {
        return <Text style={viewStyle}>{content}</Text>;
      }
    } else if (typeof content === 'object') {
      return (
        <View style={viewStyle} key={key}>
          {this.renderItem(content)}
        </View>
      );
    } else {
      return (
        <Text style={viewStyle} key={key}>
          {content}
        </Text>
      );
    }
  }

  renderItem(item, index) {
    var key = this.buildKey(item, index);
    if (typeof item === 'object') {
      if (Array.isArray(item)) {
        if (item.length > this.MAX_ARRAY_LENGTH) {
          console.log('array is too big');
          return null;
        } else if (typeof key === 'undefined') {
          return item.map(this.renderItem.bind(this));
        } else {
          return <View key={key}>{item.map(this.renderItem.bind(this))}</View>;
        }
      } else if (!item.type || item.type === 'text') {
        if (item.url) {
          var textStyle = formDataUtil.getStyleFromItem({
            item,
            styles,
            data: stylesData,
            name: 'linkText',
          });

          return this.renderLinkTextContent(
            item.content,
            item.url,
            textStyle,
            key,
          );
        } else {
          var textStyle = formDataUtil.getStyleFromItem({
            item,
            styles,
            data: stylesData,
            name: 'contentText',
          });
          return this.renderTextContent(item.content, textStyle, key);
        }
      } else if (item.type === 'view') {
        var viewStyle = formDataUtil.getStyleFromItem({
          item,
          styles,
          data: stylesData,
          name: 'viewStyle',
        });
        return this.renderViewContent(item.content, viewStyle, key);
      } else if (item.type === 'row') {
        var viewStyle = formDataUtil.getStyleFromItem({
          item,
          styles,
          data: stylesData,
          name: 'rowStyle',
        });
        return this.renderViewContent(item.content, viewStyle, key);
      } else if (item.type === 'col') {
        var viewStyle = formDataUtil.getStyleFromItem({
          item,
          styles,
          data: stylesData,
          name: 'columnStyle',
        });
        return this.renderViewContent(item.content, viewStyle, key);
      } else if (item.type === 'paragraph') {
        var viewStyle = formDataUtil.getStyleFromItem({
          item,
          styles,
          data: stylesData,
          name: 'rowStyle',
        });
        return this.renderViewContent(item.content, viewStyle, key);
      } else {
        return null;
      }
    } else if (typeof key === 'undefined') {
      return this.renderTextContent(item, styles.contentText);
    } else {
      return this.renderTextContent(item, styles.contentText, key);
    }
  }
  render() {
    if (
      typeof this.props.content === 'object' &&
      Array.isArray(this.props.content)
    ) {
      if (this.props.content.length > this.MAX_ARRAY_LENGTH) {
        console.log('array is too big');
        return null;
      } else {
        return (
          <View style={styles.columnStyle}>
            {this.props.content.map(this.renderItem.bind(this))}
          </View>
        );
      }
    } else if (this.props.content) {
      return this.renderItem(this.props.content);
    } else {
      return null;
    }
  }

  buildKey(item, index) {
    if (typeof index === 'undefined') {
      return index;
    } else if (typeof item === 'object') {
      var key = index;
      if (item.id) {
        key = item.id;
      }
      if (item.key) {
        key = item.key;
      }
      return key;
    } else {
      return index + '_' + item;
    }
  }
}
