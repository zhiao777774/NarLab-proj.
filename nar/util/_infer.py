import torch

@torch.no_grad()
def infer(text, device, model, tokenizer):
    encode_obj = tokenizer.encode_plus(text, add_special_tokens=True)
    input_ids = torch.LongTensor(encode_obj['input_ids'])
    attention_mask = torch.LongTensor(encode_obj['attention_mask'])

    input_ids = input_ids.unsqueeze(0)
    attention_mask = attention_mask.unsqueeze(0)

    model.eval()
    logits = model(
        input_ids=input_ids.to(device),
        attention_mask=attention_mask.to(device)
    ).logits

    # Normalize by softamx function.
    logits = torch.nn.functional.softmax(logits, dim=-1)

    prediction = logits.argmax(dim=-1).item()

    # Output Size:
    # logits: numpy array (1, n)
    # prediction: int
    return logits.cpu().numpy(), prediction
