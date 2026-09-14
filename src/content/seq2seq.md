---
title: 'Sooftware NLP - Seq2seq (Sequence to sequence)'
author: [Soohwan Kim]
tags: [nlp]
image: img/seq2seq.png
date: '2020-01-25T10:00:00.000Z'
draft: false
---

# Sooftware NLP - Seq2seq (Sequence to sequence)
  
본 포스팅을 이해하기 위해서는 다음 글에 대한 이해가 선행되는 것이 좋습니다.  
  
- [RNN (Recurrent Neural Network)](https://sooftware.github.io/rnn/)                                                    
- [LSTM & GRU (Long Short Term Memory & Gated Recurrent Unit)](https://sooftware.github.io/lstm_gru/)  
  
***  
  
## Seq2seq (Sequence-to-Sequence)
  
세상에는 많은 시계열 데이터 (Sequence Data) 가 존재한다.  
텍스트, 음성, 영상 등 많은 종류의 시계열 데이터가 존재하고,  
이러한 시계열 데이터들을 다른 시계열 데이터로 변환하는 문제들도 숱하게 생각할 수 있다.  
  
<img src="https://user-images.githubusercontent.com/42150335/134771361-dc0b6d38-12b1-4bc6-a750-d6c5eaa1666a.png" width="600">  
  
예컨대 기계 번역이나 음성 인식을 예로 들 수 있다.  
(Neural Machine Translation or Speech Recognition)  
  
이러한 문제를 위한 모델로 2개의 RNN을 이용하는 Seq2seq<sup>sequence to sequence</sup>라는 모델을 살펴보자 !!  
  
## Seq2seq의 원리
  
<img src="https://user-images.githubusercontent.com/42150335/134771395-4ecc674d-ddc6-4225-8737-bbbe7b8ce3c7.png" width="600">  
  
Seq2seq를 Encoder-Decoder 모델이라고도 많이들 부른다.  
이름이 말해주듯이 2개의 모듈, Encoder와 Decoder가 등장한다.  
  
Encoder는 어떤 시계열 데이터를 압축해서 표현해주고,  
Decoder는 압축된 데이터를 다른 시계열 데이터로 변환해준다.  
  
<img src="https://user-images.githubusercontent.com/42150335/134771419-8f2db6a1-57ee-4fa2-a1b9-506316975c78.png" width="600">  
  
인코더는 데이터를 입력받아서 하나의 벡터로 정보를 압축한다.  
이 때의 벡터를 <b>컨텍스트 벡터 (Context Vector)</b> 라고 하며,  
디코더는 이 컨텍스트 벡터를 이용해서 위의 그림과 같은 번역을 수행하는 것이다.  
  
## Encoder
  
<img src="https://user-images.githubusercontent.com/42150335/134771435-8cdf6c13-93ee-4e20-963a-710d35bd3ace.png" width="600">  
  
그럼 한번 Encoder부터 살펴보자.  
Encoder의 계층은 위의 그림처럼 구성된다.  
  
위의 그림처럼 Encoder는 RNN (or LSTM, GRU) 을 이용하여 데이터를  
h라는 Hidden State Vector로 변환한다.  
  
Encoder가 출력하는 벡터 h는 마지막 RNN 셀의 Hidden State이다.   
즉, Encoder는 그냥 RNN을 이어놓은 것에 불과하다.  
  
여기서 주목할 점은 Encoder가 내놓는 Context Vector는 결국 마지막 RNN 셀의  
Hidden State므로, 고정 길이 벡터라는 사실이다.  
  
<img src="https://user-images.githubusercontent.com/42150335/134771463-ad53f595-0b1b-4927-86d6-6b07559d6f82.png" width="600">
  
그래서 인코딩 한다라는 말은 결국 임의 길의의 시계열 데이터를 고정 길이 벡터로 변환하는 작업이 된다.  
  
## Decoder
  
<img src="https://user-images.githubusercontent.com/42150335/134771491-201c18ba-5ded-4a64-97a4-b1fade60f963.png" width="600">  
  
다음으로 Decoder를 살펴보자.    
Decoder는 기본적으로 RNNLM (RNN Language Model)이다.  
  
Decoder는 Encoder로부터 Context Vector (h)를 넘겨받는다.    
그리고 첫 입력으로 문장의 시작을 의미하는 심볼인 [s]가 들어간다.    
([s]는 [sos], [bos], [Go] 등 많은 이름으로 불린다)    
  
<img src="https://user-images.githubusercontent.com/42150335/134771524-eb819bce-12f8-460e-899c-b3e9d7a0f1c1.png" width="600">  
  
Decoder의 첫번째 RNN 셀은 Context Vector와 [s], 이 2개의 입력을 바탕으로  
새로운 Hidden State를 계산하고 이를 Affine 계층과 Softmax 계층을 거쳐서  
다음에 등장할 확률이 높은 "안녕하세요"를 예측한다.  
  
※ Affine 계층은 Hidden State를 입력으로 받아 분류 개수로 출력해주는 피드포워드 네트워크이다  ※  
  
<img src="https://user-images.githubusercontent.com/42150335/134771557-ad262610-582b-46cb-92de-6de78c8e0be5.png" width="600">  
  
그리고 계산한 새로운 Hidden State와 예측한 "안녕하세요"를 입력으로 해서 2번째 예측을 수행한다.  
   
<img src="https://user-images.githubusercontent.com/42150335/134771585-7c026d60-3349-4838-925f-c7bc56df6dc8.png" width="600">  
  
위의 과정을 문장의 끝을 의미하는 심볼인 [/s]가 다음 단어로 예측될 때까지 반복한다.    
([/s]는 [eos], [end] 등 많은 이름으로 불린다)  
  
### Decoder와 RNNLM  
  
여기서 디코더와 RNNLM (RNN Language Model).  
즉, RNN을 이용해서 문장을 생성하는 모델과의 유일한 차이점은  
인코더에서 만든 Context Vector를 입력받는다는 점만이 다르다.  
  
컨텍스트 벡터를 초기 입력으로 받는다는 사소한 차이점이 평범한 언어 모델도  
기계 번역, 음성 인식과 같은 복잡한 문제도 풀 수 있는 Decoder로 탈바꿈 시킬 수 있다.  
  
## Seqseq의 전체 모습  
  
<img src="https://user-images.githubusercontent.com/42150335/134771633-8fbf84f2-1b31-4b3c-ad1e-242558ceb450.png" width="600">
  
위는 Encoder와 Decoder를 연결한 Seq2seq의 전체 그림이다.  
위의 그림에서 볼 수 있듯이, Encoder의 마지막 Hidden State가  
Encoder와 Decoder의 순전파와 역전파를 이어주는 다리가 된다. 
  
## Seq2seq 개선  
  
이번에는 앞에서 본 기본적인 Seq2seq 구조를 조금 개선해보자.  
효과적인 기법이 몇 가지 존재하는데 그 중 2가지를 살펴보자.  
  
<img src="https://user-images.githubusercontent.com/42150335/134771651-1d17c46e-f9b9-487a-9f82-71c108569f09.png" width="600">  
  
첫 번째 개선안은 아주 손 쉬운 방법이다.  
위 그림에서 보듯이 입력 데이터의 순서를 반전시키는 것이다.  
  
위의 트릭은 「"Sequence to sequence learning with neural networks." Advances in neural information processing system. 2014.」 논문에서 제안했다.  
  
이 트릭을 사용하면 많은 경우 학습이 빨라져서, 최종 정확도도 좋아진다고 한다.  
  
그렇다면 왜 입력 데이터를 반전시키는 것만으로 학습이 빨라지고 정확도가 향상되는 걸까?  
직관적으로는 Gradient의 전파가 원활해지기 때문이라고 볼 수 있다.  
  
<img src="https://user-images.githubusercontent.com/42150335/134771684-c6d18e9e-c1d3-4521-a56b-58c6e25e77dc.png" width="600">  
  
예를 들어 "나는 고양이로소이다"를 "I am a cat"으로 번역하는 문제에서,  
"나"라는 단어가 "I"까지 가는 것보다 데이터를 반전시켰을 때 Gradient 전파가 잘 될 것이다.  
  
물론 평균적인 거리는 그대로이지만,  
시계열 데이터는 관련 문제에서는 앞쪽 데이터에 대한 정확한 예측이 선행되면  
뒤의 예측에서도 좋은 결과로 이어지는 경우가 많기 때문에 더 좋은 결과가 나오지 않을까 싶다.  
  
필자가 진행중인 음성 인식 (Speech Recognition) 프로젝트에서도  
입력 데이터를 반전시켰을 때 학습 속도가 상당히 개선되는 것을 확인했고,  
정확도 역시 더욱 좋아졌다.  
  
매우 간단한 트릭이기 때문에 한 번 시도해보는 것을 추천한다.  
  
### Peaky Seq2seq
  
<img src="https://user-images.githubusercontent.com/42150335/134771714-4ffc097f-a72a-4e45-ae5f-d381f35064bd.png" width="600">  
  
이어서 Seq2seq 두 번째 개선안이다.  
앞서 배운 Seq2seq의 동작을 다시 한 번 살펴보게 되면,  
Encoder는 입력 데이터를 고정 길이의 컨텍스트 벡터로 변환한다.  
  
Decoder 입장에서는 이 컨텍스트 벡터만이 예측을 하는데에 제공되는 유일한 정보인 셈이다.  
그러나 이 중요한 정보를 기본 Seq2seq에서는 최초 RNN 셀에만 전달이 된다.  
  
이러한 점을 수정해서 중요한 정보가 담긴 컨텍스트 벡터를 디코더의  
다른 계층들에게도 전달해주는 것이다.     
  
이러한 아이디어는 「”learning phrase representation using RNN encoder-decoder for statistical machine translation” Cho, Kyunhyun 2014.」 논문에서 제안되었다.  
  
Peeky Seq2seq는 기본 Seq2seq에 비해 꽤나 더 좋은 성능을 보인다고 알려져있다.  
하지만 Peeky Seq2seq는 기본 Seq2seq에 비해 파라미터가 더 늘어나기 때문에  
계산량 역시 늘어나게 된다.  
  
그리고 Seq2seq의 정확도는 하이퍼파라미터에 영향을 크게 받으므로,  
실제 문제에서는 어떤 성능을 낼지 미지수이다.  
  
## Seq2seq의 한계  
  
하지만 이러한 기본적인 Seq2seq에는 한계점이 존재한다.  
입력 데이터가 길어지게 되면 성능이 확연하게 떨어진다는 것이다.  
  
 이러한 Seq2seq의 한계를 극복하기 위해 제안된 Attention Mechanism이 있다.  
실제로 엄청난 성능 향상을 일으킨 이 어텐션 기법에 대해서는 다음 글에서 알아보자.  
  
