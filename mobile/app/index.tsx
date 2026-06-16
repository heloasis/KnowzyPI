import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router"; 
import Button from "../components/Button"; // Caminho ajustado para achar a pasta components

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>
        Tela inicial
      </Text>

      <Link href="/login" asChild>
        <Button
          title="Login"
          onPress={() => console.log("Indo para Login")}
          style={styles.botaoLogin}
        />
      </Link>
      
      <Link href="/cadastro" asChild>
        <Button
          title="Cadastro"
          onPress={() => console.log("Indo para Cadastro")}
          style={styles.Cadastro} 
          textStyle={styles.textoCadastro}
        />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000128",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  texto: {
    color: "#ffffff",
    fontSize: 18,
    marginBottom: 20,
  },
  botaoLogin: {
    marginTop: 200, 
  },
  Cadastro: {
    backgroundColor: "#000128", 
    borderRadius: 20,
    borderColor: "#b890ef",
    borderWidth: 2,
  },
  textoCadastro: {
    color: "#b890ef", 
  },
});