import React, {ChangeEvent, useEffect, useState} from 'react';
import './App.css';
import {Button, ConfigProvider, Slider} from 'antd';

import zhCN from 'antd/es/locale/zh_CN';
import 'antd/dist/antd.css';
import { Input, Upload } from 'antd';
import useForceUpdate from "antd/es/_util/hooks/useForceUpdate";

const { TextArea } = Input;

const QRCode = require('qrcode');

let mouseDown = false;
let posX = 0; let posY = 0; let lastPageX = 0; let lastPageY = 0;
let posX_T = 0; let posY_T = 0; let lastPageX_T = 0; let lastPageY_T = 0;

// 存放 qr img element map <index, element>
const qrImgElementArr: any = {};
// 存放 qr text element map <index, element>
const qrTextElementArr: any = {};

// 二维码大小
let qrWidth = 80;

// 背景图宽度
const bgWidth = 400;

let timeoutId = 0;

function getDescList(desc: string) {
  if (!desc) return [];
  return desc.split('\n');
}

function App() {

  const [ text, setText ] = useState<string>('风急天高猿啸哀\n渚清沙白鸟飞回');
  const [ showQrCode, setShowQrCode ] = useState(false);
  const [ bgBase64, setBgBase64 ] = useState<string>('');
  const [ showText, setShowText ] = useState(false);
  const [ textColor, setTextColor ] = useState('black');
  const [ desc, setDesc ] = useState('');  // 文字，用换行符分开

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
            // 显示二维码
            QRCode.toCanvas(document.getElementById(`${text}_${index}`), text, {
              width: qrWidth,
              margin: 2,
            }, function (error: Error) {
              if (error) console.error(error);
            });
            // 设置 ElementArr
            const qrElId = `canvas_container_${index}`;
            qrImgElementArr[index] = document.querySelector(`#${qrElId}`);
            const qrTextElId = `qr_text_${index}`;
            qrTextElementArr[index] = document.querySelector(`#${qrTextElId}`);
          }
        });
      }, 500);
    } else {
      setShowQrCode(false);
    }
  };

  const beforeUpload = (file: File) => {
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
  };

  const onMouseDown = (e: MouseEvent, type: 'img' | 'text') => {
    mouseDown = true;
    const {pageX, pageY} = e;
    if (type === 'img') {
      lastPageX = pageX;
      lastPageY = pageY;
    } else {
      lastPageX_T = pageX;
      lastPageY_T = pageY;
    }
  };

  const qrMove = (e: MouseEvent, type: 'img' | 'text') => {
    if (bgBase64 && mouseDown) {
      const {pageX, pageY} = e;

      if (type === 'img') {
        let offsetX = pageX - lastPageX;
        let offsetY = pageY - lastPageY;
        posX += offsetX;
        posY += offsetY;

        Object.keys(qrImgElementArr).forEach(key => {
          const el = qrImgElementArr[key];
          if (el) {
            el.style.left = `${posX}px`;
            el.style.top = `${posY}px`;
          }
        });

        lastPageX = pageX;
        lastPageY = pageY;

      } else if (type === 'text') {
        let offsetX = pageX - lastPageX_T;
        let offsetY = pageY - lastPageY_T;
        posX_T += offsetX;
        posY_T += offsetY;

        Object.keys(qrTextElementArr).forEach(key => {
          const el = qrTextElementArr[key];
          if (el) {
            el.style.left = `${posX_T}px`;
            el.style.top = `${posY_T}px`;
          }
        });

        lastPageX_T = pageX;
        lastPageY_T = pageY;
      }
    }
  };

  const onTextChange = (value: string) => {
    clearTimeout(timeoutId);
    // @ts-ignore
    timeoutId = setTimeout(() => {
      setDesc(value);
    }, 500);
  };

  useEffect(() => {
    window.addEventListener('mouseup', () => {
      mouseDown = false;
    });
  }, []);

  const descArr = getDescList(desc);

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
              marginTop: 20,
              alignSelf: 'center',
            }}
          >生成二维码</Button>
          {showQrCode && (
            <div style={{marginTop: 40}}>
              <Upload beforeUpload={beforeUpload}>
                <Button>选择背景图</Button>
              </Upload>
            </div>
          )}
          {showQrCode && (
            <div style={{marginTop: 40}}>
              <span>调整二维码大小</span>
              <Slider
                min={60}
                max={1000}
                defaultValue={qrWidth}
                onAfterChange={(value: number) => {
                  qrWidth = value;
                  submit();
                }}
              />
            </div>
          )}
          {bgBase64 && (
            <div style={{marginTop: 40}}>
              {!showText && (
                <Button
                  onClick={() => setShowText(true)}
                  style={{width: 100}}
                >添加文字</Button>
              )}
              {showText && (
                <>
                  <TextArea
                    style={{
                      marginTop: 10,
                      width: bgWidth,
                      height: 120,
                    }}
                    placeholder={text}
                    onChange={(e) => onTextChange(e.target.value)}
                  />
                  <p style={{marginTop: 10}}>文字颜色</p>
                  <div style={{display: "flex"}}>
                    {['black', 'blue', 'orange', 'red'].map((item, index) => (
                      <div
                        key={index}
                        style={{
                          width: 40, height: 40,
                          marginRight: 10, marginBottom: 10,
                          backgroundColor: item,
                          cursor: "pointer",
                        }}
                        onClick={() => setTextColor(item)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <div className="right">
          {showQrCode && getTextUrls().length > 0 && getTextUrls().map((text, index) => {
            return text && (
              <div
                key={index}
                style={{
                  marginBottom: 40,
                  position: "relative",
                }}
              >
                {bgBase64 && (
                  <img
                    src={bgBase64}
                    style={{
                      width: bgWidth,
                    }}
                  />
                )}
                <div
                  id={`canvas_container_${index}`}
                  style={{
                    zIndex: 99,
                    position: bgBase64 ? "absolute" : "relative",
                    top: 0,
                    left: 0,
                    cursor: 'move',
                  }}
                  // @ts-ignore
                  onMouseDown={e => onMouseDown(e, 'img')}
                  // @ts-ignore
                  onMouseMove={(e) => qrMove(e, 'img')}
                >
                  <canvas id={`${text}_${index}`} />
                </div>
                <span
                  id={`qr_text_${index}`}
                  style={{
                    zIndex: 99,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    fontSize: 18,
                    whiteSpace: "pre-wrap",
                    cursor: 'move',
                    color: textColor,
                  }}
                  // @ts-ignore
                  onMouseDown={e => onMouseDown(e, 'text')}
                  // @ts-ignore
                  onMouseMove={(e) => qrMove(e, 'text')}
                >{descArr[index] || ''}</span>
              </div>
            )
          })}
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
