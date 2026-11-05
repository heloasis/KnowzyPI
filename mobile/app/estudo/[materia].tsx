import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buscarConteudosMateria, type ConteudoMateria } from '../../src/services/materiaService';

export default function EstudoMateriaScreen() {
  const router = useRouter();
  const { materia } = useLocalSearchParams<{ materia: string }>();
  const [data, setData] = useState<ConteudoMateria | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const key = `knowzy:estudos:${materia}`;
  useEffect(() => { (async () => {
    try { const [content, saved] = await Promise.all([buscarConteudosMateria(String(materia)), AsyncStorage.getItem(key)]); setData(content); if (saved) setDone(JSON.parse(saved)); }
    finally { setLoading(false); }
  })(); }, [materia]);
  const toggle = async (id: string) => { const next = { ...done, [id]: !done[id] }; setDone(next); await AsyncStorage.setItem(key, JSON.stringify(next)); };
  if (loading) return <View style={styles.center}><ActivityIndicator color="#9b83ff" size="large" /></View>;
  if (!data) return <View style={styles.center}><Text style={styles.text}>Não foi possível carregar esta matéria.</Text><TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>Voltar</Text></TouchableOpacity></View>;
  const count = Object.values(done).filter(Boolean).length;
  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <TouchableOpacity onPress={() => router.back()}><Text style={styles.link}>← Voltar para matérias</Text></TouchableOpacity>
    <Text style={styles.eyebrow}>TRILHA DE APRENDIZADO</Text><Text style={styles.title}>{data.nome}</Text><Text style={styles.muted}>{data.descricao}</Text>
    <View style={styles.progressCard}><Text style={styles.text}>Seu progresso de leitura</Text><Text style={styles.progress}>{count}/{data.topicos.length} tópicos</Text><View style={styles.track}><View style={[styles.fill,{width:`${data.topicos.length ? count/data.topicos.length*100 : 0}%`}]} /></View></View>
    {data.topicos.map((topic) => <View key={topic.id} style={styles.card}><Text style={styles.topicTitle}>{topic.titulo}</Text><Text style={styles.body}>{topic.explicacao}</Text><View style={styles.example}><Text style={styles.exampleTitle}>Exemplo / aplicação</Text><Text style={styles.body}>{topic.exemplo}</Text></View><TouchableOpacity style={styles.checkRow} onPress={() => toggle(topic.id)}><Text style={styles.check}>{done[topic.id] ? '☑' : '□'}</Text><Text style={styles.text}>{done[topic.id] ? 'Estudado' : 'Marcar como estudado'}</Text></TouchableOpacity></View>)}
    <TouchableOpacity style={styles.button} onPress={() => router.push({ pathname:'/quiz', params:{ materia:String(materia), nome:data.nome } })}><Text style={styles.buttonText}>Praticar no quiz →</Text></TouchableOpacity>
    <View style={styles.comingSoon}><Text style={styles.comingSoonText}>Tutor IA — em breve</Text></View>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flex:1,backgroundColor:'#060312'},content:{padding:22,paddingTop:55,paddingBottom:40},center:{flex:1,backgroundColor:'#060312',alignItems:'center',justifyContent:'center'},text:{color:'#e8eaff'},link:{color:'#a99bff',fontSize:15},eyebrow:{color:'#a99bff',fontSize:11,fontWeight:'800',letterSpacing:2,marginTop:30},title:{color:'#fff',fontSize:34,fontWeight:'800',marginTop:8},muted:{color:'#b8bfdc',lineHeight:22,marginTop:8},progressCard:{backgroundColor:'#171c3b',padding:16,borderRadius:16,marginVertical:22},progress:{color:'#c9c1ff',fontWeight:'700',marginTop:8},track:{height:8,backgroundColor:'#34385b',borderRadius:10,marginTop:10,overflow:'hidden'},fill:{height:8,backgroundColor:'#9b83ff'},card:{backgroundColor:'#111936',borderWidth:1,borderColor:'#303c70',borderRadius:18,padding:18,marginBottom:16},topicTitle:{color:'#fff',fontSize:20,fontWeight:'700',marginBottom:10},body:{color:'#d6dcf4',lineHeight:23},example:{backgroundColor:'#1b2450',borderLeftWidth:3,borderLeftColor:'#9b83ff',padding:12,borderRadius:8,marginTop:14},exampleTitle:{color:'#cfc6ff',fontWeight:'700',marginBottom:5},checkRow:{flexDirection:'row',alignItems:'center',gap:10,marginTop:16},check:{color:'#b9aaff',fontSize:23},button:{backgroundColor:'#5269a5',padding:16,borderRadius:12,alignItems:'center',marginTop:10},buttonText:{color:'#fff',fontWeight:'700'},comingSoon:{backgroundColor:'#33256a',padding:16,borderRadius:12,alignItems:'center',marginTop:10},comingSoonText:{color:'#fff',fontWeight:'700'}});
