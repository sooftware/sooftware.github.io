---
title: 'Sooftware NLP - Teacher Forcing (티쳐포싱)'
author: [Soohwan Kim]
tags: [nlp]
image: img/teacher_forcing.png
date: '2020-01-25T10:00:00.000Z'
draft: false
---

# Sooftware NLP - Teacher Forcing (티쳐포싱)
  
본 포스팅을 이해하기 위해서는 다음 글에 대한 이해가 선행되는 것이 좋습니다.  
  
- [RNN (Recurrent Neural Network)](https://sooftware.github.io/rnn/)                                                    
- [LSTM & GRU (Long Short Term Memory & Gated Recurrent Unit)](https://sooftware.github.io/lstm_gru/)
- [Seq2seq (Sequence to sequence)](https://sooftware.github.io/seq2seq/)  
  
***  
  
## Teacher Forcing의 개요
  
***Teacher Forcing is the technique where the target word is passed as the next input to the decoder***  
  
티쳐 포싱은 Seq2seq (Encoder-Decoder) 을 기반으로 한 모델들에서 많이 사용되는 기법이다.  
  
<img src="https://user-images.githubusercontent.com/42150335/149659739-9dc7e4be-3702-438f-85b9-f1a7604e9d43.png" width="400">  
  
티쳐 포싱은 target word(Ground Truth)를 디코더의 다음 입력으로 넣어주는 기법이다.  
  
<img src="https://user-images.githubusercontent.com/42150335/149659792-cbe4ba4e-7862-476a-8e47-b85a6bfff9b7.png" width="400">
  

티쳐 포싱이 적용되지 않은 Seq2seq 모델의 디코더를 생각해보자.  t-1 번째의 디코더 셀이 예측한 값 (y_hat) 을 t번째 디코더의 입력으로 넣어준다.
  
t-1번째에서 정확한 예측이 이루어졌다면 상관없지만, 잘못된 예측이 이루어졌다면 t번째 디코더의 추론 역시 잘못된 예측으로 이어질 것이다.  
   
<img src="https://user-images.githubusercontent.com/42150335/149659836-550c5dea-1d1e-4587-9acb-6cd2d14ec8a2.png" width="400">  
  
이전 예측을 고려해주는 디코더의 장점이 잘못된 예측 앞에서는 엄청난 단점이 되어버린다.
  
특히 이러한 단점은 학습 초기에 학습 속도 저하의 요인이 된다. 이러한 단점을 해결하기 위해 나온 기법이 티쳐포싱(Teacher Forcing) 기법이다.
  
<img src="https://user-images.githubusercontent.com/42150335/149659856-b7ef82fb-b260-453a-9242-7f7a3a00fcfd.png" width="400">
  
위와 같이 입력을 Ground Truth로 넣어주게 되면, 학습시 더 정확한 예측이 가능하게 되기 때문에 초기 학습 속도를 빠르게 올릴 수 있다.
  
## Teacher Forcing의 쉬운 비유
  
<img src="https://user-images.githubusercontent.com/42150335/149659876-d032ef83-6165-4bf3-8cf4-008f1036e324.png" width="400">
  
위와 같이 문제 A의 답이 문제 B의 계산에 필요하고, 문제 B의 답이 문제 C의 풀이에 이용되는 문제들을 생각해보자.
  
### Teacher Forcing 미사용
  
학생은 문제 A, B, C를 순서대로 풀이하고 답 a, b, c를 한꺼번에 작성하여 제출  
교사는 이 답안지를 보고 a, b, c를 한꺼번에 채점하여 점수를 알려줌.
  
### Teacher Forcing 사용
  
학생은 문제 A를 풀이하고 답 a를 제출
교사는 답안지를 가져가고, 정답 a를 알려줌  
학생은 문제 A의 답 a를 가지로 문제 B를 풀이하고 답 b를 제출
  
## Teacher Forcing 기법의 장단점
  
### 학습이 빠르다
  
학습 초기 단계에서는 모델의 예측 성능이 나쁘다. 때문에 Teacher Forcing을 이용하지 않으면 잘못된 예측 값을 토대로 Hidden State 값이 업데이트되고, 이 때문에 모델의 학습 속도는 더뎌지게 된다.
  
### 노출 편향 문제 (Exposure Bias Problem)
  
추론 (Inference) 과정에서는 Ground Truth를 제공할 수 없다. 때문에 모델은 전 단계의 자기 자신의 출력값을 기반으로 예측을 이어가야한다. 이러한 학습과 추론 단계에서의 차이 (discrepancy) 가 존재하여 모델의 성능과 안정성을 떨어뜨릴 수 있다.
  
다만 노출 편향 문제가 생각만큼 큰 영향을 미치지 않는다는 2019년 연구 결과가 나와 있다고 한다.  
(T. He, J. Zhang, Z. Zhou, and J. Glass. Quantifying Exposure Bias for Neural Language Generation (2019), arXiv.)
  
  

  