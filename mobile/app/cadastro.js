import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function CadastroScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Página de Cadastro</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#000128", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  texto: { 
    color: "#ffffff", 
    fontSize: 20 
  }
});