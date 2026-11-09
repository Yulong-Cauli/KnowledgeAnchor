# K-fcos 运行状态

- 2026-11-09 白天补班提交 Kaggle v1，14:02（北京时间）复查为 `RUNNING`。T4 会话，推理只使用设备 0，5.5 小时时限。
- 预注册 `bd9dab93ef7c623d2f16e51799c9f833cd972c4f`。提交的 notebook SHA256 `8120996c6efea5b0078b3b780e70f57583280f36ce19d2146e815e94be4ded81`。
- 先核对 CUDA NMS、5,000 张 COCO val2017 图像、官方 checkpoint 与前 8 张的原版输出。通过后执行配对评测并输出两臂 AP 和 NMS 保留框差异。首查仅确认会话启动，运行门和指标待收回。
- [Kaggle 运行](https://www.kaggle.com/code/cauliyulong/ka-verify-fcos-centerness)
