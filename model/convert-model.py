import tensorflow as tf

model = tf.keras.models.load_model('Trained_model.h5', compile=False)
tf.saved_model.save(model, 'tensorflow')