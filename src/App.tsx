import React, {useState} from 'react';
import './App.css';
import {Button, ConfigProvider} from 'antd';

import zhCN from 'antd/es/locale/zh_CN';
import 'antd/dist/antd.css';
import { Input, Upload } from 'antd';
import ImgCrop from 'antd-img-crop';

const { TextArea } = Input;

const QRCode = require('qrcode');

const WIDTH = 200;

function App() {

  const [ text, setText ] = useState<string>('陈志磊\n张树华\n陈世超');
  const [ showQrCode, setShowQrCode ] = useState(false);
  const [ bgBase64, setBgBase64 ] = useState<string>('');

  const getTextUrls = () => {
    if (!text) return [];
    return text.split('\n');
  };

  const submit = () => {
    const arr = getTextUrls();
    if (arr.length > 0) {
      setShowQrCode(true);
      setTimeout(() => {
        arr.forEach((text, index) => {
          if (text) {
            QRCode.toCanvas(document.getElementById(`${text}_${index}`), text, {
              width: WIDTH,
              margin: 0,
            }, function (error: Error) {
              if (error) console.error(error);
            })
          }
        });
      }, 1000);
    } else {
      setShowQrCode(false);
    }
  };

  return (
    <ConfigProvider locale={zhCN}>
      <div className="App">
        <div className="left">
          <TextArea
            placeholder='输入地址，换行分开'
            value={text}
            onChange={(params: { target: { value: string } }) => {
              setText(params.target.value || '');
            }}
            style={{
              height: 200,
            }}
          />
          <Button
            size='large'
            type='primary'
            onClick={submit}
            style={{
              width: 100,
              marginTop: 20,
              alignSelf: 'center',
            }}
          >提交</Button>
          <div style={{marginTop: 40}}>
            <ImgCrop rotate>
              <Upload
                beforeUpload={file => {
                  // file 对象转 base64
                  // 声明js的文件流
                  const reader = new FileReader();
                  if (file){
                    // 通过文件流将文件转换成Base64字符串
                    reader.readAsDataURL(file);
                    // 转换成功事件函数
                    reader.onloadend = () => {
                      setBgBase64(reader.result as string);
                    }
                  }
                  return false;
                }}
              >
                <Button>选择背景图</Button>
              </Upload>
            </ImgCrop>
          </div>
        </div>
        <div className="right">
          {showQrCode && getTextUrls().length > 0 && getTextUrls().map((text, index) => {
            return text && (
              <div
                key={index}
                style={{marginBottom: 40, position: "relative"}}
              >
                {bgBase64 && (
                  <img
                    src={bgBase64}
                    style={{
                      position: "absolute",
                      width: WIDTH,
                      height: WIDTH,
                      objectFit: "cover",
                    }}
                  />
                )}
                <div style={{opacity: bgBase64 ? 0.6 : 1}}>
                  <canvas id={`${text}_${index}`} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
