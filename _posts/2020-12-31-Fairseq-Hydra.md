---
layout: post
title: "Fairseq-Hydra"
date: 2020-12-31 03:15:30 +300
image: hydra2.png
tags: open-source
---

## [Fairseq's Hydra](https://github.com/pytorch/fairseq/blob/master/docs/hydra_integration.md)  
  
- Fairseq이 0.10.1로 버젼 업그레이드를 하면서 configuration 관리를 Hydra로 하게됨.
- Fairseq을 실행시키는 command line상에서도, 모델 코드 상에서도 몇 가지 변화가 있음.   
  
***  
  
### Creating or migrating components

- 기존 모델 코드는 `add_args()`라는 static method로 config를 관리  
  
```python
@staticmethod
def add_args(parser):
    """Add model-specific arguments to the parser."""
    # fmt: off
    parser.add_argument('--dropout', type=float, metavar='D',
                        help='dropout probability')
    parser.add_argument('--encoder-embed-dim', type=int, metavar='N',
                        help='encoder embedding dimension')
    parser.add_argument('--encoder-embed-path', type=str, metavar='STR',
                        help='path to pre-trained encoder embedding')
```
> 이런 방식은 코드를 읽을 때, 어떤 argument들이 사용되는지 한 번에 보기가 어렵다는 단점이 있음. 
> → 내부적으로 사용되는 모듈들을 하나하나 찾아가서 확인해봐야함. 
> → 복잡한 모델일수록 더욱 코드 읽기가 어려워짐.
  
- `@dataclass` 데코레이터를 이용하는 class를 이용하는 방법으로 수정 (Tasks & Models) 
  
```python
@dataclass
class Wav2Vec2Config(FairseqDataclass):
    extractor_mode: EXTRACTOR_MODE_CHOICES = field(
        default="default",
        metadata={
            "help": "mode for feature extractor. default has a single group norm with d "
            "groups in the first conv block, whereas layer_norm has layer norms in "
            "every block (meant to use with normalize=True)"
        },
    )
    encoder_layers: int = field(
        default=12, metadata={"help": "num encoder layers in the transformer"}
    )
    encoder_embed_dim: int = field(
        default=768, metadata={"help": "encoder embedding dimension"}
    )
    encoder_ffn_embed_dim: int = field(
        default=3072, metadata={"help": "encoder embedding dimension for FFN"}
    )
```

> FairseqDataclass를 상속받는 클래스를 정의해서 사용 → [Example](https://github.com/pytorch/fairseq/blob/master/fairseq/models/wav2vec/wav2vec2.py)

- Task Example
  
```python
@dataclass
class LanguageModelingConfig(FairseqDataclass):
    data: Optional[str] = field(
        default=None, metadata={"help": "path to data directory"}
    )
    ...

@register_task("language_modeling", dataclass=LanguageModelingConfig)
class LanguageModelingTask(LegacyFairseqTask):
    ...
    @classmethod
    def setup_task(cls, cfg: LanguageModelingConfig):
        ...
```
- Model Example
  
```python
@dataclass
class TransformerLanguageModelConfig(FairseqDataclass):
    activation_fn: ChoiceEnum(utils.get_available_activation_fns()) = field(
        default="relu", metadata={"help": "activation function to use"}
    )
    dropout: float = field(default=0.1, metadata={"help": "dropout probability"})
    ...

@register_model("transformer_lm", dataclass=TransformerLanguageModelConfig)
class TransformerLanguageModel(FairseqLanguageModel):
    ...
    @classmethod
    def build_model(cls, cfg: TransformerLanguageModelConfig, task: FairseqTask):
        ...

```
- 기존 방법(`add_args()`)은 여전히 서포트 되지만, 이후 언젠가 deprecated 될 것이라고 함.
  
*** 
  
### Training with `fairseq-hydra-train`
  
- configuraion 관리를 hydra로 하기 때문에 기존에 사용했던 `fairseq-train`이 아닌 `fairseq-hydra-train` training  
- Override default values through command line:
  
```
$ fairseq-hydra-train \
    distributed_training.distributed_world_size=1 \
    dataset.batch_size=2 \
    task.data=data-bin \
    model=transformer_lm/transformer_lm_gpt \
    task=language_modeling \
    optimization.max_update=5000
```
- Replace bundled configs with an external config:
  
```
$ fairseq-hydra-train \
    --config-dir /path/to/external/configs \
    --config-name wiki103
```
where /path/to/external/configs/wiki103.yaml contains:
  
```yaml
# @package _group_

model:
  _name: transformer_lm
distributed_training:
  distributed_world_size: 1
dataset:
  batch_size: 2
task:
  _name: language_modeling
  data: /path/to/data
  add_bos_token: false
  max_target_positions: 1024
optimization:
  max_update: 50000
  lr: [ 0.25 ]
criterion: cross_entropy
optimizer: adam
lr_scheduler:
  _name: cosine
```
