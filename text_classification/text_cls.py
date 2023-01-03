
import numpy as np
import torch
from torch.utils.data import DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification, AdamW
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from dataset import load_data, NARDataset


### 設定 ###
file_name = 'new_data.xlsx'
model_name = "bert-base-chinese"
batch_size = 4
learning_rate = 2e-5
num_epoch = 1
seed = 42
###########


X, tmp_y = load_data(file_name, one_class=True)
classes = np.unique(tmp_y)
label_map = {c: i for i, c in enumerate(classes)}

# y = []
# for tmp in tmp_y:
#     new_y = label_map[tmp]
#     y.append(new_y)
y = [label_map[tmp] for tmp in tmp_y] # list comprehension

train_X, val_X, train_y, val_y = train_test_split(
    X, y, test_size=0.2, random_state=seed
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Training data
train_encodings = tokenizer(train_X, truncation=True, padding=True)
trainset = NARDataset(train_encodings, train_y)
train_loader = DataLoader(trainset, batch_size=batch_size, shuffle=True)

# Val/ testing data
val_encodings = tokenizer(val_X, truncation=True, padding=True)
valset = NARDataset(val_encodings, val_y)
val_loader = DataLoader(valset, batch_size=batch_size, shuffle=False)

device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=len(classes),
)
optimizer = AdamW(model.parameters(), lr=learning_rate)

model.to(device)
model.train()
for epoch in range(num_epoch):
    train_loss = 0
    for batch in train_loader:
        optimizer.zero_grad()

        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        segs = batch['token_type_ids'].to(device)

        labels = batch['labels'].to(device)
        
        outputs = model(
            input_ids,
            attention_mask=attention_mask,
            token_type_ids = segs,
            labels=labels,
        )

        loss = outputs[0]
        loss.backward()
        optimizer.step()
        train_loss += loss.item()

    print(f"Epoch: {epoch}, loss: {train_loss / len(train_loader)}")

model.eval()
predictions = []
probabilities = []
for batch in val_loader:
    input_ids = batch['input_ids'].to(device)
    attention_mask = batch['attention_mask'].to(device)
    segs = batch['token_type_ids'].to(device)
    outputs = model(
        input_ids,
        attention_mask=attention_mask,
        token_type_ids = segs,
    )[0]
    preds = outputs.argmax(dim=1).cpu().numpy()

    # Choices: softmax, sigmoid
    # probs = torch.nn.functional.softmax(outputs, dim=1).cpu().numpy() # probabilities
    probs = torch.nn.functional.sigmoid(outputs).cpu().numpy() # probabilities

    predictions.extend(list(preds))
    probabilities.append(list(probs))

print(f"Accuracy: {accuracy_score(val_y, predictions)}")