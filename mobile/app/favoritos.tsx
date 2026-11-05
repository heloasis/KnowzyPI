import React, { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/context/AuthContext';
import type { Materia } from '../src/types/quiz';

export default function FavoritosScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const key = `knowzy:favoritos:${user?.id || 'local'}`;
  const [favoritos, setFavoritos] = useState<Materia[]>([]);
  useFocusEffect(useCallback(() => {
    let active = true;
    AsyncStorage.getItem(key).then((saved) => { if (active) setFavoritos(saved ? JSON.parse(saved) : []); }).catch(() => { if (active) setFavoritos([]); });
    return () => { active = false; };
  }, [key]));
  const removerFavorito = async (id: string) => {
    const next = favoritos.filter((item) => String(item.id) !== id);
    setFavoritos(next);
    await AsyncStorage.setItem(key, JSON.stringify(next));
  };
  const abrirMateria = (materia: Materia) => router.push({ pathname: '/estudo/[materia]' as any, params: { materia: String(materia.slug || materia.id), nome: materia.nome } });
  return <SafeAreaView style={styles.safeArea}><StatusBar barStyle="light-content"/><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.headerRow}><TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#fff"/></TouchableOpacity><Text style={styles.title}>Favoritos</Text></View>
    {favoritos.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyIcon}>♡</Text><Text style={styles.emptyTitle}>Nenhum favorito salvo</Text><Text style={styles.emptyText}>Adicione matérias pela tela Matérias para encontrá-las aqui.</Text><TouchableOpacity style={styles.browseButton} onPress={() => router.push('/materias')}><Text style={styles.browseText}>Explorar matérias</Text></TouchableOpacity></View> : favoritos.map((materia) => <View key={String(materia.id)} style={styles.card}><TouchableOpacity style={styles.cardMain} onPress={() => abrirMateria(materia)}><Text style={styles.icon}>📘</Text><View style={styles.textWrap}><Text style={styles.cardTitle}>{materia.nome}</Text><Text style={styles.cardText}>{materia.descricao || 'Conteúdo de estudo'}</Text></View></TouchableOpacity><TouchableOpacity onPress={() => removerFavorito(String(materia.id))} style={styles.removeButton}><Ionicons name="heart-dislike" size={18} color="#fff"/></TouchableOpacity></View>)}
  </ScrollView></SafeAreaView>;
}
const styles=StyleSheet.create({safeArea:{flex:1,backgroundColor:'#060312'},content:{padding:20,paddingBottom:36},headerRow:{flexDirection:'row',alignItems:'center',marginBottom:18},backButton:{width:42,height:42,borderRadius:12,backgroundColor:'rgba(255,255,255,0.06)',justifyContent:'center',alignItems:'center',marginRight:12},title:{color:'#fff',fontSize:28,fontWeight:'800'},card:{flexDirection:'row',alignItems:'center',backgroundColor:'#10182c',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',padding:16,marginBottom:14},cardMain:{flexDirection:'row',alignItems:'center',flex:1},icon:{fontSize:30,marginRight:14},textWrap:{flex:1},cardTitle:{color:'#fff',fontSize:18,fontWeight:'700',marginBottom:4},cardText:{color:'#b7c2ea',fontSize:12,lineHeight:18},removeButton:{width:38,height:38,borderRadius:12,backgroundColor:'#8C61FF',justifyContent:'center',alignItems:'center'},emptyCard:{backgroundColor:'#10182c',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',padding:26,alignItems:'center'},emptyIcon:{fontSize:42,color:'#8C61FF',marginBottom:12},emptyTitle:{color:'#fff',fontSize:20,fontWeight:'700',marginBottom:8},emptyText:{color:'#b7c2ea',fontSize:13,textAlign:'center',lineHeight:20},browseButton:{backgroundColor:'#5269a5',paddingHorizontal:18,paddingVertical:12,borderRadius:12,marginTop:18},browseText:{color:'#fff',fontWeight:'700'}});
