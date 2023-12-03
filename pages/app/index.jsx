import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Select, message } from 'antd';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { fontBase64 } from '/public/fonts/Base64-Arial.js';

const { Option } = Select;

const App = () => {
  const [timebase, setTimebase] = useState('23.976');
  const [filmTitle, setFilmTitle] = useState('');
  const [href, setHref] = useState("");
  const [downloadFileName, setDownloadFileName] = useState("");
  const ffmpeg = useRef();

  const generatePrerollVideo = async () => {
    try {
      const arialBase64 = fontBase64;
      const fontData = await fetchFile(`data:font/ttf;base64,${arialBase64}`);
      ffmpeg.current.FS('writeFile', 'Arial.ttf', fontData);

      const prerollCommand = [
        '-f', 'lavfi',
        '-i', `color=c=black:s=640x480:r=${timebase}`,
        '-t', '10',
        '-vf', `drawtext=fontfile=Arial.ttf:text='${filmTitle}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,8)',drawtext=fontfile=Arial.ttf:text='2':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,8,8.041)'`,
        '-af', `sine=frequency=1000:duration=0.041:enable='between(t,8,8.041)'`,
        '-c:v', 'prores',
        '-profile:v', '3',
        'preroll.mov'
      ];

      await ffmpeg.current.run(...prerollCommand);
      const data = ffmpeg.current.FS('readFile', 'preroll.mov');
      const blob = new Blob([data.buffer], { type: 'video/quicktime' });
      const url = URL.createObjectURL(blob);
      setHref(url);
      setDownloadFileName('preroll.mov');
    } catch (error) {
      console.error('Error generating preroll video:', error);
      message.error('Failed to generate preroll video');
    }
  };

  useEffect(() => {
    (async () => {
      ffmpeg.current = createFFmpeg({
        log: true,
        corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
      });
      await ffmpeg.current.load();
    })();
  }, []);

  return (
    <div className="page-app">
      <h2 align="center">Preroll Video Generator</h2>

      <div className="input-group">
  <label htmlFor="timebase-select">Select Frame Rate:</label>
  <Select
    id="timebase-select"
    value={timebase}
    style={{ width: 120 }}
    onChange={setTimebase}
  >
    <Option value="23.976">23.976 fps</Option>
    <Option value="24">24 fps</Option>
    <Option value="25">25 fps</Option>
    <Option value="29.97">29.97 fps</Option>
    <Option value="30">30 fps</Option>
  </Select>

  <Input
    value={filmTitle}
    placeholder="Enter film title"
    onChange={(event) => setFilmTitle(event.target.value)}
  />

  <Button type="primary" onClick={generatePrerollVideo}>
    Generate Preroll Video
  </Button>
</div>

{href && (
  <div>
    <a href={href} download={downloadFileName}>
      Download Preroll Video
    </a>
  </div>
)}
</div>
);
};

export default App;