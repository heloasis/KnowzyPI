import React, { forwardRef } from "react"; // 1. Importamos o forwardRef
import { StyleSheet, Text, TouchableOpacity } from "react-native";

// 2. Envolvemos o componente com o forwardRef e adicionamos o parâmetro 'ref'
const Button = forwardRef(({ title, onPress, style, textStyle }, ref) => {
  return (
    <TouchableOpacity
      ref={ref} // 3. Passamos a referência para o TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
});

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#b890ef",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    width: 200,
  },
  text: {
    color: "#000000", 
    fontSize: 16,
  },
});