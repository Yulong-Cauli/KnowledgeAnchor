# FCOS center-ness 配对评测

关联 `claim-fcos-centerness-suppresses-low-quality`（`asserted / watch`）。待检验的机制来自 FCOS 论文。本次预注册以 [四组验证池任务书 K-fcos](../../tmp_docs/05-夜间验证班任务书-四组验证池.md) 为准。

- 模型为 MMDetection v2.28.2 模型库的 `fcos_r50_caffe_fpn_gn-head_1x_coco`，使用对应官方 checkpoint `821213aa`。模型库 box AP 为 36.6。运行时记录 Git 提交、checkpoint、标注和图片 ID 列表的 SHA256，以及环境快照。
- 数据为 `awsaf49/coco-2017-dataset` 的 COCO val2017。须有 5,000 张唯一图像、36,781 条实例标注、80 类，且所有图片路径存在。使用模型库的单尺度 1333×800、无翻转评测管线。
- 两臂共用同一张图像的 backbone 和检测头输出。基线为 MMDetection 原生 `cls × center-ness`。对照仅移除 `get_bboxes` 的 `score_factors`，两臂使用相同的分类分数筛选、每层 top-k、解码和 NMS。该比较为同权重推理消融，论文的 RPN AR100 和无分支训练均在范围外。
- 分别记录 NMS 后、每图上限前的保留框多重集是否一致，以及官方每图上限后的多重集是否一致。以类别和原图 `xyxy` 坐标识别保留框。前 8 张同时跑官方 `simple_test`，要求与基线截断后结果逐项一致。任何一张不一致即停止。
- 判读以全量、配对及基线 AP 在 36.6±0.5 pp 为前提。记 `ΔAP = cls-only − native`，`ΔAP ≥ +0.5 pp` 登记为预设反例方向，`ΔAP < 0` 登记为机制支持方向。两臂 NMS 保留框在所有图上完全相同则登记为保留集反例方向。仅改变保留框不能判断低质量框的富集程度。
- Kaggle GPU 单会话，单卡 FP32 推理。先做 GPU 算子、资产和 8 张等价门，设置 5.5 小时时限，停在时限内的结果只标部分进度。环境使用新栈探针底座并补同代 `torchvision`，以真实 CUDA NMS 检查作为运行门槛。

[模型库版本](https://github.com/open-mmlab/mmdetection/blob/v2.28.2/configs/fcos/metafile.yml) · [原生打分及 NMS 实现](https://github.com/open-mmlab/mmdetection/blob/v2.28.2/mmdet/models/dense_heads/base_dense_head.py)
