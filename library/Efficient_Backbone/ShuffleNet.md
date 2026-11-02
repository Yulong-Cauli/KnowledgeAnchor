# ShuffleNet: An Extremely Efficient Convolutional Neural Network for Mobile Devices

**出处会议：** CVPR 2018（arXiv:1707.01083，v2 2017-12-07；Xiangyu Zhang, Xinyu Zhou, Mengxiao Lin, Jian Sun，Megvii Inc (Face++)，前两位作者标注同等贡献。注：本次抓取的 arXiv abs 页无 Comments 字段，CVPR 2018 出处系任务给定，正式版权页未核对）  
**是否开源：** 官方开源——https://github.com/megvii-model/ShuffleNet-Series （README 自述 "ShuffleNet Series by Megvii Research"，ShuffleNetV1 条目链接即 arXiv:1707.01083，含预训练模型下载；2026-11-02 访问核验。arXiv abs 页与 ar5iv 全文本身无代码链接；`Megvii-BaseDetection/ShuffleNet` 已 404）  
**关键词：** 轻量级 CNN、pointwise 组卷积 (pointwise group convolution)、channel shuffle、深度可分离卷积 (depthwise separable convolution)、MobileNet 对比、ImageNet 分类、MS COCO 检测、ARM 实测加速

> **Locator 约定：** 本笔记章节号（§1–§4，含 §3.1–§3.3、§4.1–§4.5）、图号（Figure 1–2）、表号（Table 1–8）均指 arXiv:1707.01083 v2 的 ar5iv HTML 版（https://ar5iv.labs.arxiv.org/html/1707.01083 ，抓取日期 2026-11-02；LaTeXML 渲染）。该版 §1 自称 "This report"，与 CVPR 2018 camera-ready 的措辞/页码可能有出入（见 TODO）。英文引号内文字为本次实际抓取的逐字原文（ar5iv 将未解析的参考文献渲染为原 cite key，如 `howard2017mobilenets`，个别引文中此类键已删去并以 … 标示删除处，其余逐字）；行内数学按渲染结果转写（$\times$→×、$\sim$→∼、$\%$→%）。所有数字均为论文声称，未经独立验证。表格逐行照抄，并经脚本对抓取文本逐行核验。

---

## 1. 概述

ShuffleNet 要解决的问题：在极小计算预算（约 10–150 MFLOPs）下设计高效的基础网络结构。论文摘要开篇（Abstract）：

> "We introduce an extremely computation-efficient CNN architecture named ShuffleNet, which is designed specially for mobile devices with very limited computing power (e.g., 10-150 MFLOPs)."

动机（§1）：

> "This report examines the opposite extreme: pursuing the best accuracy in very limited computational budgets at tens or hundreds of MFLOPs, focusing on common mobile platforms such as drones, robots, and smartphones."

两个核心操作（Abstract）：

> "The new architecture utilizes two new operations, pointwise group convolution and channel shuffle, to greatly reduce computation cost while maintaining accuracy."

即：(a) 把组卷积用到 1×1（pointwise）卷积上以降低其主要计算开销；(b) 用 channel shuffle 克服组卷积堆叠带来的组间信息隔离。作者对背景的判断（§1；省略号处为 ar5iv 未解析的引注键删除位，其余逐字）：

> "We notice that state-of-the-art basic architectures such as Xception … become less efficient in extremely small networks because of the costly dense 1×1 convolutions."

论文声称的主要结果（Abstract、§1）：

- ImageNet 分类：40 MFLOPs 预算下，top-1 错误率比 MobileNet 绝对低 7.8%——"absolute 7.8% lower ImageNet top-1 error at level of 40 MFLOPs"（§1）；
- ARM 移动设备实测：对 AlexNet 约 13× 实际加速且精度相当（理论加速 18×）——"ShuffleNet achieves ∼13× actual speedup over AlexNet while maintaining comparable accuracy."（Abstract；§4.5）；
- MS COCO 目标检测（Faster-RCNN）上同样验证了迁移泛化（§4.4）。

另与同期 NAS 工作 NASNet 对照（§2 Efficient Model Designs）：

> "The proposed mobile NASNet model achieves comparable performance with our counterpart ShuffleNet model (26.0% @ 564 MFLOPs vs. 26.3% @ 524 MFLOPs for ImageNet classification error)."

作者并指出 NASNet 未报告极小模型（<150 MFLOPs）与移动端实测（§2）。

---

## 2. 方法

### 2.1 为什么对 1×1 卷积做组卷积（§3.1）

Xception/ResNeXt 引入深度可分离卷积或组卷积，但"do not fully take the 1×1 convolutions ... into account"（§3.1，此处 1×1 即 MobileNet 中的 pointwise convolutions，§3.1 原文标注）。关键数据：ResNeXt（cardinality = 32）每个残差单元中 pointwise 卷积占乘加量的 93.4%（§3.1）。在小网络里，昂贵的 pointwise 卷积挤占通道数（§3.1）：

> "In tiny networks, expensive pointwise convolutions result in limited number of channels to meet the complexity constraint, which might significantly damage the accuracy."

直接把组卷积用于 1×1 层的副作用：多个组卷积堆叠时，某一输出通道只来自一小部分输入通道（§3.1）：

> "This property blocks information flow between channel groups and weakens representation."

### 2.2 Channel shuffle（§3.1）

让下一层的组卷积拿到跨组的输入子组。机制原文（§3.1，行内数学按渲染转写）：

> "we first reshape the output channel dimension into (g,n), transposing and then flattening it back as the input of next layer"

即对 g 组、g×n 通道的输出，reshape 成 (g,n) 后转置再展平，作为下一层输入。补充性质（§3.1）：

- "Note that the operation still takes effect even if the two convolutions have different numbers of groups."（两组卷积组数不同时依然有效）；
- "Moreover, channel shuffle is also differentiable, which means it can be embedded into network structures for end-to-end training."（可微，可端到端训练）。

渊源（§2 Channel Shuffle Operation）：作者称该想法在高效网络设计中很少被提及，cuda-convnet 的 “random sparse convolution” 层等价于随机 channel shuffle + 组卷积，但目的不同；同期 Interleaved group convolutions（ICCV 2017）也采用了类似思想，但未专门研究 channel shuffle 本身及其在极小模型中的作用（§2）。

与 MobileNet 的关系（论文原文有据，一句带过）：论文自述 "Our work generalizes group convolution and depthwise separable convolution in a novel form."（§2 Group Convolution）——即 ShuffleNet 的"组卷积 pointwise + shuffle"与 MobileNet 所用深度可分离卷积（1×1 逐点 + 3×3 逐通道）是面向同一目标的两种路线，§4.3/Table 5 显示同预算下 ShuffleNet 精度全面占优（详见 §3.5）。

### 2.3 ShuffleNet Unit（§3.2，Figure 2）

从 ResNet bottleneck 残差块出发（Figure 2 (a)）：

- 3×3 层换成 depthwise convolution，且只作用于 bottleneck 特征图；
- 第一个 1×1 层换成 pointwise group convolution + channel shuffle（Figure 2 (b)）："Then, we replace the first 1×1 layer with pointwise group convolution followed by a channel shuffle operation, to form a ShuffleNet unit, as shown in Fig 2 (b)."；
- 第二个 pointwise 组卷积用于恢复通道数以匹配 shortcut："The purpose of the second pointwise group convolution is to recover the channel dimension to match the shortcut path."；第二个 pointwise 层之后不再加 shuffle（"as it results in comparable scores"，§3.2）；
- BN 与非线性的用法同 ResNet/ResNeXt，但 "we do not use ReLU after depthwise convolution"（依 Xception，§3.2）；
- stride=2 变体（Figure 2 (c)）：shortcut 路径加 3×3 平均池化；元素加法换成通道拼接（便于低成本扩大通道维度）（§3.2）。

复杂度对比（§3.2；公式按 LaTeX 转写，非引文）：输入 $c\times h\times w$、bottleneck 通道 $m$、组数 $g$ 时，

- ResNet unit：$hw(2cm+9m^2)$ FLOPs；
- ResNeXt：$hw(2cm+9m^2/g)$ FLOPs；
- ShuffleNet unit：$hw(2cm/g+9m)$ FLOPs。

> "In other words, given a computational budget, ShuffleNet can use wider feature maps. We find this is critical for small networks, as tiny networks usually have an insufficient number of channels to process the information."

关于 depthwise conv 只放 bottleneck 的原因（§3.2）：

> "Even though depthwise convolution usually has very low theoretical complexity, we find it difficult to efficiently implement on low-power mobile devices, which may result from a worse computation/memory access ratio compared with other dense operations."

### 2.4 网络架构（§3.3，Table 1）

- 三组 stage 堆叠 ShuffleNet unit，每 stage 第一个块 stride=2，stage 间输出通道翻倍（§3.3）；
- "we set the number of bottleneck channels to 1/4 of the output channels for each ShuffleNet unit"（同 ResNet，§3.3）；
- 组数 g 控制点wise 卷积连接稀疏度；"larger group numbers result in more output channels (thus more convolutional filters) for a given complexity constraint, which helps to encode more information, though it might also lead to degradation for an individual convolutional filter due to limited corresponding input channels"（§3.3）；
- 复杂度缩放：通道数乘尺度因子 s，"ShuffleNet s×" 整体复杂度约为 ShuffleNet 1× 的 s² 倍（§3.3）。

**Table 1: ShuffleNet architecture. The complexity is evaluated with FLOPs, i.e. the number of floating-point multiplication-adds. Note that for Stage 2, we do not apply group convolution on the first pointwise layer because the number of input channels is relatively small.**（逐行照抄；"Image" 行在 g=1–8 各列均为 "3"，按抓取 HTML 原样转录）

| Layer | Output size | KSize | Stride | Repeat | g=1 | g=2 | g=3 | g=4 | g=8 |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| Image | 224×224 | | | | 3 | 3 | 3 | 3 | 3 |
| Conv1 | 112×112 | 3×3 | 2 | 1 | 24 | 24 | 24 | 24 | 24 |
| MaxPool | 56×56 | 3×3 | 2 | | | | | | |
| Stage2 | 28×28 | | 2 | 1 | 144 | 200 | 240 | 272 | 384 |
| | 28×28 | | 1 | 3 | 144 | 200 | 240 | 272 | 384 |
| Stage3 | 14×14 | | 2 | 1 | 288 | 400 | 480 | 544 | 768 |
| | 14×14 | | 1 | 7 | 288 | 400 | 480 | 544 | 768 |
| Stage4 | 7×7 | | 2 | 1 | 576 | 800 | 960 | 1088 | 1536 |
| | 7×7 | | 1 | 3 | 576 | 800 | 960 | 1088 | 1536 |
| GlobalPool | 1×1 | 7×7 | | | | | | | |
| FC | | | | | 1000 | 1000 | 1000 | 1000 | 1000 |
| Complexity | | | | | 143M | 140M | 137M | 133M | 137M |

---

## 3. 实验

### 3.1 训练设置（§4）

ImageNet 2012 分类，训练设置大体沿用 ResNeXt，两处例外（§4）：

> "we set the weight decay to 4e-5 instead of 1e-4 and use linear-decay learning rate policy (decreased from 0.5 to 0)"

以及"slightly less aggressive scale augmentation"（数据增强的缩放更保守；小网络欠拟合而非过拟合，作者称此类修改亦见于 MobileNet，§4）。训练量级：3×10^5 iterations、4 GPUs、batch size 1024、每模型 1–2 天；评测为单 crop top-1（256× 输入取 224×224 中心 crop），所有模型设置完全一致（§4）。

### 3.2 Pointwise 组卷积消融（§4.1.1，Table 2）

g=1 即无 pointwise 组卷积（”Xception-like” 结构，引号字形按抓取原文）。结论（§4.1.1）：

> "models with group convolutions (g>1) consistently perform better than the counterparts without pointwise group convolutions (g=1)"

> "Smaller models tend to benefit more from groups."

量级：ShuffleNet 1× 最优组（g=8）比 g=1 好 1.2%；0.5×、0.25× 上差距分别达 3.5%、4.4%（§4.1.1）。作者归因于同复杂度下更宽的特征图（§4.1.1）。同时注意：组数过大时精度饱和甚至下降（如 ShuffleNet 0.5× 的 g=8 反而不如 g=4；仅 0.25× 小模型上组数越大越好，§4.1.1）。

**Table 2: Classification error vs. number of groups g（smaller number represents better performance）**（逐行照抄；列为 top-1 分类错误率 %）

| Model | Complexity (MFLOPs) | g=1 | g=2 | g=3 | g=4 | g=8 |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| ShuffleNet 1× | 140 | 33.6 | 32.7 | 32.6 | 32.8 | 32.4 |
| ShuffleNet 0.5× | 38 | 45.1 | 44.4 | 43.2 | 41.6 | 42.3 |
| ShuffleNet 0.25× | 13 | 57.1 | 56.8 | 55.0 | 54.2 | 52.7 |

### 3.3 Channel shuffle 消融（§4.1.2，Table 3）

> "It is clear that channel shuffle consistently boosts classification scores for different settings."

组数大时收益更显著（§4.1.2）："models with channel shuffle outperform the counterparts by a significant margin, which shows the importance of cross-group information interchange."

**Table 3: ShuffleNet with/without channel shuffle（smaller number represents better performance）**（逐行照抄）

| Model | Cls err. (%, no shuffle) | Cls err. (%, shuffle) | Δ err. (%) |
| :--- | ---: | ---: | ---: |
| ShuffleNet 1x (g=3) | 34.5 | 32.6 | 1.9 |
| ShuffleNet 1x (g=8) | 37.6 | 32.4 | 5.2 |
| ShuffleNet 0.5x (g=3) | 45.7 | 43.2 | 2.5 |
| ShuffleNet 0.5x (g=8) | 48.1 | 42.3 | 5.8 |
| ShuffleNet 0.25x (g=3) | 56.3 | 55.0 | 1.3 |
| ShuffleNet 0.25x (g=8) | 56.5 | 52.7 | 3.8 |

### 3.4 与其他结构单元对比（§4.2，Table 4）

同一整体架构（Table 1），把 Stage 2–4 的 ShuffleNet unit 换成 VGG-like / ResNet（bottleneck 1:4）/ Xception-like（即 ShuffleNet 去掉组卷积与 shuffle，g=1）/ ResNeXt（cardinality=16, bottleneck 1:2），通道数适配到同复杂度（§4.2）。结果：

**Table 4: Classification error vs. various structures（%, smaller number represents better performance）. We do not report VGG-like structure on smaller networks because the accuracy is significantly worse.**（逐行照抄；"-" 为原文空格，未报告）

| Complexity (MFLOPs) | VGG-like | ResNet | Xception-like | ResNeXt | ShuffleNet (ours) |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 140 | 50.7 | 37.3 | 33.6 | 33.3 | 32.4 (1×, g=8) |
| 38 | - | 48.8 | 45.1 | 46.0 | 41.6 (0.5×, g=4) |
| 13 | - | 63.7 | 57.1 | 65.2 | 52.7 (0.25×, g=8) |

机制性观察（§4.2）：

> "we find an empirical relationship between feature map channels and classification accuracy"

38 MFLOPs 下各模型 Stage 4 输出通道数：VGG-like 50、ResNet 192、ResNeXt 192、Xception-like 288、ShuffleNet 576——与精度排序一致（§4.2）。另外：Inception 系列因超参过多难以公平缩到小网络；PVANET 复现版 557 MFLOPs、29.7%，低于 ShuffleNet 2× (g=3) 的 524 MFLOPs、26.3%（§4.2）。

### 3.5 与 MobileNet 及其他框架对比（§4.3，Table 5、Table 6）

**Table 5: ShuffleNet vs. MobileNet howard2017mobilenets on ImageNet Classification**（逐行照抄，引注键按抓取原样保留于表注与单元格；Δ err. 为相对 MobileNet 的错误率差；"-" 为原文空格）

| Model | Complexity (MFLOPs) | Cls err. (%) | Δ err. (%) |
| :--- | ---: | ---: | ---: |
| 1.0 MobileNet-224 | 569 | 29.4 | - |
| ShuffleNet 2× (g=3) | 524 | 26.3 | 3.1 |
| ShuffleNet 2× (with SE hu2017squeeze, g=3) | 527 | 24.7 | 4.7 |
| 0.75 MobileNet-224 | 325 | 31.6 | - |
| ShuffleNet 1.5× (g=3) | 292 | 28.5 | 3.1 |
| 0.5 MobileNet-224 | 149 | 36.3 | - |
| ShuffleNet 1× (g=8) | 140 | 32.4 | 3.9 |
| 0.25 MobileNet-224 | 41 | 49.4 | - |
| ShuffleNet 0.5× (g=4) | 38 | 41.6 | 7.8 |
| ShuffleNet 0.5× (shallow, g=3) | 40 | 42.8 | 6.6 |

结论（§4.3）：

> "It is clear that our ShuffleNet models are superior to MobileNet for all the complexities."

具体：约 40 MFLOPs 小网络上超过 MobileNet 7.8%；500 MFLOPs 量级仍比 MobileNet 1× 准 3.1%（§4.3）。深度混淆控制："Note that our ShuffleNet architecture contains 50 layers while MobileNet only has 28 layers." 为此做了 26 层 shallow 版（去掉 Stage 2–4 一半的块），"the shallower model is still significantly better than the corresponding MobileNet, which implies that the effectiveness of ShuffleNet mainly results from its efficient structure, not the depth."（§4.3）

与经典模型对比（Table 6，§4.3）：ShuffleNet 0.5× 理论上比 AlexNet 快 18× 且精度相当（41.6 vs 42.8 错误率）。

**Table 6: Complexity comparison. \*Implemented by BVLC (https://github.com/BVLC/caffe/tree/master/models/bvlc_googlenet)**（逐行照抄）

| Model | Cls err. (%) | Complexity (MFLOPs) |
| :--- | ---: | ---: |
| VGG-16 | 28.5 | 15300 |
| ShuffleNet 2× (g=3) | 26.3 | 524 |
| GoogleNet\* | 31.3 | 1500 |
| ShuffleNet 1× (g=8) | 32.4 | 140 |
| AlexNet | 42.8 | 720 |
| SqueezeNet | 42.5 | 833 |
| ShuffleNet 0.5× (g=4) | 41.6 | 38 |

SE 模块组合（§4.3）："boosting the top-1 error of ShuffleNet 2× to 24.7% (shown in Table 5)"；但提示实际开销："we find ShuffleNets with SE modules are usually 25∼40% slower than the “raw” ShuffleNets on mobile devices, which implies that actual speedup evaluation is critical on low-cost architecture design"

### 3.6 泛化：MS COCO 目标检测（§4.4，Table 7）

Faster-RCNN（Caffe 公开实现，默认设置），COCO train+val 训练、minival 测试（§4.4）。524 vs 569 MFLOPs 下 ShuffleNet 2× 两个分辨率都明显超过 MobileNet；"our ShuffleNet 1× also achieves comparable results with MobileNet on 600× resolution, but has ∼4× complexity reduction"（约 4× 复杂度缩减）。作者归因："We conjecture that this significant gain is partly due to ShuffleNet's simple design of architecture without bells and whistles."

**Table 7: Object detection results on MS COCO（larger numbers represents better performance）. For MobileNets we compare two results: 1) COCO detection scores reported by howard2017mobilenets; 2) finetuning from our reimplemented MobileNets, whose training and finetuning settings are exactly the same as that for ShuffleNets.**（逐行照抄，引注键按抓取原样保留于表注）

| Model | mAP [.5,.95] (300× image) | mAP [.5,.95] (600× image) |
| :--- | ---: | ---: |
| ShuffleNet 2× (g=3) | 18.7% | 25.0% |
| ShuffleNet 1× (g=3) | 14.5% | 19.8% |
| 1.0 MobileNet-224 | 16.4% | 19.8% |
| 1.0 MobileNet-224 (our impl.) | 14.9% | 19.3% |

### 3.7 实测加速（§4.5，Table 8）

平台：ARM（Qualcomm Snapdragon 820 单线程，Table 8 表注）。g=4/g=8 精度更好但当前实现效率低，"Empirically g=3 usually has a proper trade-off between accuracy and actual inference time."（§4.5）经验规律（§4.5）：

> "Due to memory access and other overheads, we find every 4× theoretical complexity reduction usually results in ∼2.6× actual speedup in our implementation."

> "Nevertheless, compared with AlexNet … our ShuffleNet 0.5× model still achieves ∼13× actual speedup under comparable classification accuracy (the theoretical speedup is 18×)"（省略号处为引注键删除位）

**Table 8: Actual inference time on mobile device（smaller number represents better performance）. The platform is based on a single Qualcomm Snapdragon 820 processor. All results are evaluated with single thread.**（逐行照抄）

| Model | Cls err. (%) | FLOPs | 224×224 | 480×640 | 720×1280 |
| :--- | ---: | ---: | ---: | ---: | ---: |
| ShuffleNet 0.5× (g=3) | 43.2 | 38M | 15.2ms | 87.4ms | 260.1ms |
| ShuffleNet 1× (g=3) | 32.6 | 140M | 37.8ms | 222.2ms | 684.5ms |
| ShuffleNet 2× (g=3) | 26.3 | 524M | 108.8ms | 617.0ms | 1857.6ms |
| AlexNet | 42.8 | 720M | 184.0ms | 1156.7ms | 3633.9ms |
| 1.0 MobileNet-224 | 29.4 | 569M | 110.0ms | 612.0ms | 1879.2ms |

---

## 4. 核心结论

1. pointwise 组卷积 + channel shuffle 是两个正交可拆的组件：组卷积在小模型上稳定降错（g>1 全面优于 g=1，越小模型收益越大，最多 4.4%，§4.1.1/Table 2）；channel shuffle 在所有测试设置下一致降错，g 越大收益越大（最多 5.8%，§4.1.2/Table 3）。
2. 同复杂度下通道数与精度的经验关系是全文反复出现的解释线索：ShuffleNet 靠省计算换更宽特征图（Stage 4 通道 576 vs 各基线 50–288，§4.2/Table 4；复杂度公式 §3.2）。
3. 论文声称在所有测试复杂度上优于 MobileNet（§4.3/Table 5），~40 MFLOPs 下 top-1 错误率绝对低 7.8%；shallow 对照实验把优势归因于结构而非深度（§4.3）。
4. 理论加速 ≠ 实测加速：每 4× 理论复杂度缩减实测只有 ~2.6×（§4.5/Table 8）；对 AlexNet 实测 ~13×（理论 18×）。SE 模块理论开销可忽略却实测慢 25∼40%——作者据此强调低功耗结构设计必须做实测评估（§4.3、§4.5）。
5. 架构极简、超参少（组数 g、尺度因子 s），便于迁移与组合最新组件（SE、Swish 等，§4.3）；COCO 检测迁移结果支撑其泛化（§4.4/Table 7）。

## 5. 与库内笔记的关系

- 库内尚无 MobileNet / MobileOne 笔记正文（仅 `library/assets/MobileNet/`、`library/assets/MobileOne/` 存在配图目录），可比关系暂只能依据本文抓取内容：ShuffleNet 的 "pointwise 组卷积 + channel shuffle" 与 MobileNet 的 depthwise separable convolution 是同一目标（移动端卷积降本）的两种路线，论文自述 "Our work generalizes group convolution and depthwise separable convolution in a novel form."（§2 Group Convolution），并以 Table 5/Table 7/Table 8 在分类、检测、实测速度三方面对比。MobileNet/MobileOne 笔记入库后，可回填对比表（注意：本文 MobileNet 数据出自 arXiv:1704.04861，与库内后续笔记核对时以各自论文为准）。
- §2 Model Acceleration 列举的剪枝/量化/分解/蒸馏方向与库内量化笔记（如 `library/Quantization/`）属不同路线：ShuffleNet 改基础结构本身，不改训练或数值精度。

---

## TODO

- [x] 库内既有素材内容核对（2026-11-03 入库）：`library/assets/ShuffleNet/Figure_ExperimentComparison.png` 逐张查看图片内容后确认——图例为 "Xception / ShuffleNet v1 / MobileNet v2 / **ShuffleNet v2 (Ours)**"，四个面板为 GPU/ARM 上吞吐 vs 精度、吞吐 vs MFLOPs 散点，属 **ShuffleNet V2 论文**（Ma et al., ECCV 2018）的实验对比图，**不是本文（ShuffleNet V1, arXiv:1707.01083）的 Figure 1/2**。按「逐张核对内容再引用」纪律，该图**不回填、不引用**到本笔记（素材文件名与论文内容错位的实锤案例）。
- [ ] 配图仍缺（不新建 assets 目录）：本文 Figure 1（channel shuffle 图示）、Figure 2（ShuffleNet units）无对应素材，留 TODO，待补抓或用户提供。
- [ ] 本文为 arXiv v2（2017-12-07）ar5iv HTML 版抓取；CVPR 2018 camera-ready 的页码与措辞未核对（v2 §1 自称 "This report"）。如需页码级 locator 或正式版权页/Comments 字段佐证出处，需补抓 CVF Open Access 版。
- [ ] Table 1 的 "Image" 行在 g=1–8 各列均为 "3"（按抓取 HTML 逐字转录，应为输入 3 通道图的标注）；未与 CVPR 版核对，如疑为渲染错位需对照 PDF。
- [ ] 预训练模型可用性未实测（官方仓库给出 OneDrive/BaiduYun 链接，未逐一验证可下载）。
- [ ] 入库 QA 记录（2026-11-03）：本笔记由草稿（`nightshift/drafts/ShuffleNet.md`，保留不删）逐字复制入库；英文引句 49 条（含重复出现共 53 处）经脚本验证在草稿文本中逐字存在（自洽检查；论文源核验于草稿创建时完成，见「抓取记录」，本次 /tmp 抓取产物已不在，未重抓）；8 处数字抽查与表格行一致——摘要 "absolute 7.8% lower" = Table 5（0.25 MobileNet-224 49.4 − ShuffleNet 0.5×(g=4) 41.6 = 7.8）；§4.1.1 组卷积增益 1.2%/3.5%/4.4% = Table 2（33.6−32.4、45.1−41.6、57.1−52.7）验算成立；Table 3 Δ 列抽核 0.5x(g=8) 5.8 = 48.1−42.3；§4.3 "500 MFLOPs 量级准 3.1%" = Table 5（29.4−26.3）；实测 ~13× 加速与 Table 8（AlexNet 184.0ms / ShuffleNet 0.5× 15.2ms，184.0/15.2≈12.1，论文口径 ∼13×；理论 720/38≈18.9 与 "18×" 相容）；Table 6 0.5× 41.6 vs AlexNet 42.8 "精度相当"；§2 NASNet 引句 "26.3% @ 524 MFLOPs" = Table 5/6 ShuffleNet 2×(g=3) 行。尚未经用户审阅。

## 抓取记录

- abs 页：https://arxiv.org/abs/1707.01083 （抓取日期 2026-11-02；标题 "ShuffleNet: An Extremely Efficient Convolutional Neural Network for Mobile Devices"，与任务给定标题一致；作者 Xiangyu Zhang, Xinyu Zhou, Mengxiao Lin, Jian Sun；v1 2017-07-04，v2 2017-12-07；Comments 字段缺失）
- 全文：https://ar5iv.labs.arxiv.org/html/1707.01083 （抓取日期 2026-11-02，LaTeXML 渲染版；§1–§4、Table 1–8 均出自该版并经脚本逐行核验；公式为 LaTeX 转写）
- 开源核验：https://github.com/megvii-model/ShuffleNet-Series （抓取日期 2026-11-02，HTTP 200，README 自述 "ShuffleNet Series by Megvii Research"，ShuffleNetV1 链接 arXiv:1707.01083）；另核验 https://github.com/Megvii-BaseDetection/ShuffleNet 返回 404
- 入库：2026-11-03，经逐字 QA 后写入 `library/Efficient_Backbone/ShuffleNet.md`（草稿保留于 `nightshift/drafts/ShuffleNet.md` 未删除）。
