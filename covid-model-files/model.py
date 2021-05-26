import sys
# from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
from PIL import Image
import io
import re
from tensorflow.keras.models import load_model
from keras.models import Sequential, Model
from keras.layers import Dense, Dropout, Flatten
from keras.layers import Conv2D, Activation, MaxPooling2D
from keras.utils import normalize
from keras.layers import Concatenate
from keras import Input
import tensorflow as tf
# app = Flask(__name__)

# print('hello')


import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--infile', nargs=1,
                    help="JSON file to be processed",
                    type=argparse.FileType('r'))
arguments = parser.parse_args()

# Loading a JSON object returns a dict.
d = json.load(arguments.infile[0])

profileInfo = {}
profileInfo.update(d)
# print(profileInfo)
# Overwrite the profileInfo dict

# print(type(profileInfo))


label_dict = {0:'Covid19 Positive', 1:'Covid19 Negative'}

def preprocess(img):

	img = np.array(img)
	# print(img.shape)

	if(img.ndim==3):
		gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
	else:
		gray = img

	gray = gray/255
	resized = cv2.resize(gray, (100, 100))
	reshaped = resized.reshape(1, 100, 100)
	# print(reshaped.shape)
	return reshaped

message = profileInfo["data"]
decoded = base64.b64decode(message)
# print(decoded)
dataBytesIO = io.BytesIO(decoded)
dataBytesIO.seek(0)
image = Image.open(dataBytesIO)
# image.show()
# # print(type(image))
# # print("hello")

test_image = preprocess(image)


# inp = Input(shape=(100,100,1))
# convs = []

# parrallel_kernels = [3,5,7]

# for k in range(len(parrallel_kernels)):

#   conv = Conv2D(128, parrallel_kernels[k], padding='same', activation='relu',input_shape=(100,100,1), strides=1)(inp)
#   convs.append(conv)

# out = Concatenate()(convs)
# conv_model = Model(inputs=inp, outputs=out)

# model = Sequential()
# model.add(conv_model)

# model.add(Conv2D(64,(3,3)))
# model.add(Activation('relu'))
# model.add(MaxPooling2D(pool_size=(2,2)))

# model.add(Conv2D(32,(3,3)))
# model.add(Activation('relu'))
# model.add(MaxPooling2D(pool_size=(2,2)))

# model.add(Flatten())
# model.add(Dropout(0.5))
# model.add(Dense(128,activation='relu'))
# model.add(Dropout(0.5))
# model.add(Dense(64,activation='relu'))
# model.add(Dropout(0.5))
# model.add(Dense(2,input_dim=128,activation='softmax'))
# model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

model = load_model('C:/Users/Saad Ur Rehman/Desktop/COVID19/covid-model-files/h5_saved_model')
# model = tf.saved_model.load(
#     export_dir='P:/covid-site/tf_saved_model', tags=None, options=None
# )
# model.summary()
prediction = model.predict(test_image)
result = np.argmax(prediction, axis=1)[0]
accuracy=float(np.max(prediction, axis=1)[0])

label = label_dict[result]

output = json.dumps({"prediction": label, "probability": accuracy})

print(output)

quit()
# print(prediction, result, accuracy, label)


# response = {'prediction': {'result':label, 'accuracy':accuracy}}

# print('helo')