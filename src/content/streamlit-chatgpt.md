---
layout: post
title: 단 30줄로 ChatGPT 웹페이지 만들기 (Streamlit chat_message)
image: img/streamlit-chatgpt.png
author:
  - Soohwan Kim
date: 2024-05-01T10:00:00.000Z
tags:
  - toolkit
  - web
  - chatgpt
excerpt:
---

# 단 30줄로 ChatGPT 웹페이지 만들기 (Streamlit chat_message)

[Streamlit](https://github.com/streamlit/streamlit)은 파이썬 기반의 오픈소스 웹 UI 라이브러리입니다. 매우 간단한 코드로 손쉽게 웹페이지를 띄울 수 있어서 간단한 데모나 PoC 제품을 빠르게 만들어볼때 굉장히 유용합니다. 실제로 개인적으로 간단한 데모를 만들때 [Gradio](https://github.com/gradio-app/gradio)와 함께 가장 많이 쓰는 라이브러리입니다.  

<img width="400" alt="image" src="https://github.com/sooftware/sooftware.io/assets/42150335/134118d0-c4b2-4689-bc85-4c805b8c7154">


두 라이브러리 모두 간단하게 웹페이지를 띄울 수 있다는 장점이 있지만, 제 경험상 streamlit으로 코드를 작성했을 때 보다 간편헀던 것 같습니다. 그래서 이번 포스트에서는 streamlit에서 제공하는 **chat_message** 메서드와 OpenAI API를 이용해서 **단 30줄의 코드**로 ChatGPT를 웹페이지에 띄워보려고 합니다! (chat_message 외의 사용법을 알고싶으신 분들은 [이전 streamlit 포스트](https://sooftware.github.io/streamlit/)를 참고하세요!)

## Installation

먼저 스트림릿 설치를 위해서 아래 커먼드롤 입력합니다.

```
$ pip install streamlit
```

그리고 OpenAI API 사용을 위해서 아래 커맨드로 openai 라이브러리도 설치해줍니다.

```
$ pip install openai==1.2.0
```

참고로 openai 버전은 꼭 1.2.0이 아니여도 되지만, 버전마다 사용법이 조금씩 다를 수 있기 때문에, 이번 포스트에서는 버전을 고정해줬습니다.

## Build Streamlit ChatGPT Page
  
이 섹션에서는 Streamlit을 처음 사용해보신다고 가정하고 하나하나 자세하게 보고 넘어가겠습니다. 이미 Streamlit에 익숙해서 전체 코드만 필요하신 분은 아래로 내리시면 코드가 있으니 해당 부분 참고하시면 되겠습니다. :)
  
### Step 1: import libraries
```python
import streamlit as st  
import os  
from openai import OpenAI
```

먼저, 필요한 라이브러리들을 import 해줍니다. 앞에서 설치해준 streamlit, openai와 openai API 키 등록을 위해 기본 내장 라이브러리인 os를 import 해줍니다.

### Step 2: OpenAI API 세팅

```python
os.environ["OPENAI_API_KEY"] = "YOUR_OPENAI_API_KEY"  
client = OpenAI()
```

환경에 OpenAI API 키를 등록하고, API 사용을 위한 client를 생성합니다. OpenAI API 키는 https://platform.openai.com 에서 회원가입 및 결제카드를 등록하면 받을 수 있습니다.

### Step 3: Streamlit 코드 작성

이제 본격적으로 Streamlit 코드를 작성해주면 됩니다!  

먼저 생성할 페이지의 타이틀과 ChatGPT와 주고받을 메세지를 저장할 리스트를 생성해줍니다.

```python
st.title("Streamlit ChatGPT")  
  
if 'messages' not in st.session_state:  
    st.session_state.messages = []  
```
  
Streamlit은 기본적으로 매 event가 발생할때마다 페이지를 새로 로드하는 방식입니다. 그래서 **st.session_state**가 아닌 새로 변수를 생성하게 되면 이벤트가 발생할대마다 해당 변수가 초기화되어 버립니다. 그래서 스트림릿에서 변수들을 기록할때는 **st.session_state**에 위와 같은 형식으로 저장하는 것을 추천드립니다.

다음으로는 사용자로부터 텍스트를 입력받을 창과 텍스트를 전송할 버튼을 만들어 보겠습니다.

```python
user_message = st.text_input("User:")  
  
if st.button("Send"):  
    st.session_state.messages.append({"role": "user", "content": user_message})
```
  
스트림릿에서 텍스트를 입력받을 때는 **st.text_input** 메서드를 사용합니다. 버튼은 **st.button** 메서드를 이용하면 되는데, 저희는 버튼이 눌렸을때의 동작이 필요하므로 **if st.button("Send")** 와 같이 작성했습니다. 그리고 유저 메세지를 ChatGPT에게 보내기 위해 기존에 초기화를 해둔 **st.session_state.messages**에 ChatGPT에서 요구하는 형식에 맞게 append를 해주겠습니다.  

```python
if st.button("Send"):  
    st.session_state.messages.append({"role": "user", "content": user_message})  
  
    completion = client.chat.completions.create(  
        model="gpt-3.5-turbo",  
        messages=st.session_state.messages,  
    )  
    response = completion.choices[0].message.content  
    st.session_state.messages.append({"role": "assistant", "content": response}) 
```

입력받은 유저 메세지를 ChatGPT에게 전송해서 응답을 받아옵니다! 이전 세팅에서 생성한 openai client의 **chat.completions.create** 메서드를 이용하여 응답을 받아오고, ChatGPT의 응답을 유저 메세지 같이 **st.session_state.messages**에 append 해줍니다. 여기까지 코드작성이 됐다면 아래와 같은 플로우가 완성됩니다!

1. 유저 메세지 입력
2. messages에 유저 메세지 추가
3. messages 기반으로 ChatGPT 응답 생성
4. ChatGPT 응답 messages에 추가
5. 1로 돌아가서 반복하며 messages에는 [유저, ChatGPT, 유저, ChatGPT, ...] 순서로 주고받은 대화 내역이 저장됨

### Step 4: chat_message 메서드로 대화 display

주고받은 대화들을 시각적으로 볼 수 있게 하기 위해 주고받는 대화들을 streamlit의 **chat_message** 메서드로 display 해줍니다.
 
```python
for message in reversed(st.session_state.messages):  
    with st.chat_message(message['role']):  
        if message['role'] == 'user':  
            st.write(message['content'])  
        else:  
            st.write(message['content'], avatar=st.image('assets/openai-logo.png', width=30))
```

위에서 저장한 **st.session_state.messages**를 for 문을 돌면서 하나씩 가져와서 사용자인지 ChatGPT인지를 판별하고, display 해줍니다. (최근 대화가 위에 오도록 하기 위하여 reversed 메서드를 사용합니다) 조금 더 명확하게 표시를 해주기 위해 ChatGPT의 경우 미리 저장해둔 OpenAI logo로 아바타를 표시해줬습니다.

## Step 5: Run Streamlit

Streamlit 기반 웹페이지를 실행할때는 아래와 같이 **streamlit run \*\*\*.py** 형식으로 입력해주시면 됩니다. 저는 파이썬 파일명을 app.py로 했으니 아래와 같이 실행했습니다.

```
$ streamlit run app.py
```

위 명령어를 실행하면 아래와 같이 Streamlit으로 만든 ChatGPT 페이지를 사용해볼 수 있습니다!

<img width="500" alt="image" src="https://github.com/sooftware/sooftware.io/assets/42150335/2dff5ff4-2ee5-49b2-a3eb-3fadd1ab51e0">
이렇게 총 31줄의 코드로 AI와 대화하는 웹페이지를 만들 수 있다니 세상 좋아졌다는게 체감이 됩니다. 😎   

이번 포스트에서는 간단하게 ChatGPT와 대화하는 정도의 페이지만 만들었지만 스트림릿에서 제공하는 더 많은 기능들을 활용하면 보다 복잡한 어플리케이션도 빠르게 제작할 수 있습니다. 아래는 제가 운영하는 서비스인 [Dearmate](https://dearmate.ai/) 케릭터들과의 대화를 Streamlit으로 만들어본 예시입니다.  

<img src="https://github.com/sooftware/sooftware.io/assets/42150335/236e96dd-c65f-4489-9c06-154c92702c95" width=400>

이렇게 Streamlit을 활용하면 내부 데모페이지, PoC 정도의 페이지를 손쉽게 구성할 수 있습니다. 저도 일하면서 반복적으로 손이 가는 업무들은 스트림릿을 이용해서 웹페이지를 하나 띄워두고 즐겨찾기 해두고 일을 하는데, 상당히 편리하고 일의 능률도 많이 올라갑니다. 😎 이 포스트를 읽는 여러분들도 스트림릿을 적극적으로 활용해보시는 것을 추천합니다!

### 전체 코드

```python
import streamlit as st  
import os  
from openai import OpenAI  
  
os.environ["OPENAI_API_KEY"] = "YOUR_OPENAI_API_KEY"  
client = OpenAI()  
  
st.title("Streamlit ChatGPT")  
  
if 'messages' not in st.session_state:  
    st.session_state.messages = []  
  
user_message = st.text_input("User:")  
  
if st.button("Send"):  
    st.session_state.messages.append({"role": "user", "content": user_message})  
  
    completion = client.chat.completions.create(  
        model="gpt-3.5-turbo",  
        messages=st.session_state.messages,  
    )  
    response = completion.choices[0].message.content  
    st.session_state.messages.append({"role": "assistant", "content": response})  
  
for message in reversed(st.session_state.messages):  
    with st.chat_message(message['role']):  
        if message['role'] == 'user':  
            st.write(message['content'])  
        else:  
            st.write(message['content'], avatar=st.image('assets/openai-logo.png', width=30))
```