# NAR project
## 任務
1. 從excel表格文字中挑出重要的欄位
2. 對重要的欄位中的文字進行主題分類
## 資料
### 資料存放格式
├── data
│   ├── folder_nar
## 模型訓練與評估
### 訓練模型
```
python3 -m nar.script.run_nar_train
```
### 評估模型
```
python3 -m nar.script.run_nar_test --experiment nar_1
```
### nar 資料夾格式
```
├── nar
│   ├── dset: (包裝 dataset 的)
│   ├── script: (訓練與評估模型的腳本都寫在這裡)
│   ├── util: (定義訓練與模型時需要用到的功能)
```
### 目前模型 (nar.script)
### Demo 網站
- 目前網站 demo 的成大計劃書分類標注呈現，是讀取事先分類好的結果進行呈現。
1. 成大計畫書 - 分類標注
2. 單句輸入 - 分類標注
```
python website_main.py -v v2
```

