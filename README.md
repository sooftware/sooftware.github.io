# sooftware.github.io
  
This is my personal blog by react. https://sooftware.github.io
    
## Get Started
  
- Clone this project
  
```
$ git clone https://github.com/sooftware/sooftware.github.io
```
  
- If you have no nodejs
  
```
$ sudo apt install nodejs
$ sudo apt install npm
```
    
- If nodejs and npm are installed,
  
```
$ npm install react-icons --save --no-audit
$ npm install @react-pdf/renderer --save --no-audit
$ npm install react-linkify --save --no-audit
$ npm install --no-audit
```
  
- Now, you can run.
  
```
$ npm start
```
  
- Check webpage
  
```
http://localhost:8000
```
  
## Deploy

`main` 브랜치에 push 하면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드해서 GitHub Pages로 배포합니다.
