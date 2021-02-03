---
layout: post
title: "Computer Architecture Review"
date: 2021-02-05 03:15:30 +300
image: 04.jpg
tags: review
---

## Computer Architecture Review
  
오랜만에 컴퓨터 구조에서 배운 내용을 조금 복습해보며 감을 잡기 위함

### 컴퓨터가 코드를 처리하는 과정  
1. Read Code
2. Assembly 변환 
3. **CPU에서 실행**
  
### CPU에서 하나의 명령(Ex) Add)을 실행하는 과정 (5단계)
1. IF: Instruction Fetch (명령어 가져오기)
2. ID: Instruction Decode (무슨 명령어인지)
3. EX: Execute / Adress calculation (명령 실행 or 접근할 주소 계산)
4. MEM: Access Memory (메모리에 접근)
5. WB: Write (변수 업데이트)
  
### 위의 5단계가 CPU (Single Cycle Datapath)에서 실행되는 과정
  
- 한 번의 Cycle에 명령 하나씩 처리

---
layout: post
title: "ComputerArchitecture Review"
date: 2021-01-23 03:15:30 +300
image: x1.png
tags: open-source
---

![image](https://user-images.githubusercontent.com/42150335/106787176-baca2380-6692-11eb-9f5f-a6c0a4ae97b3.png)
  
- 시간 비용

![image](https://user-images.githubusercontent.com/42150335/106787296-e3521d80-6692-11eb-8991-7f25c9d665d4.png)
  
### Pipeline
  
- 나누어진 부분을 경계로 병렬적으로 처리

![image](https://user-images.githubusercontent.com/42150335/106787546-2f04c700-6693-11eb-8041-f988e7e0ce07.png)
  
- 시간 비용  
  
![image](https://user-images.githubusercontent.com/42150335/106787829-8440d880-6693-11eb-84f7-6a16f957b7c4.png)
  
### Hazard
  
- Instruction을 실행하기 위한 데이터가 준비되지 않아서 Instruction을 실행할 수 없는 경우

![image](https://user-images.githubusercontent.com/42150335/106788164-f44f5e80-6693-11eb-9117-6c187ced8fbf.png)
  
- 해결 방법 1: Data Forwarding
   
![image](https://user-images.githubusercontent.com/42150335/106788436-4a240680-6694-11eb-8ce1-ca67136cf0f3.png)
  
필요한 데이터가 register나 memory에 write 될 때까지 기다리지 않고, internal buffer로부터 읽어서 Hazard를 해결하는 방법  
  
- 해결 방법 2: Stall (Bubble)
  
![image](https://user-images.githubusercontent.com/42150335/106788736-af77f780-6694-11eb-9a0f-f92ff79d7ddd.png)
  
Hazard를 피할 수 없는 경우 아무 명령을 처리하지 않는 nop (No-operation) 를 넣음으로써 Data Forwarding을 할 수 있도록 싱크를 맞춰주는 방법
  
