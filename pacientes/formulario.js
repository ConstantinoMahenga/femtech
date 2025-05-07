import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView,
    Platform,
    Linking,
    StatusBar, // Import StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather'; // Para o ícone de voltar

const ContactFormScreen = ({ route, navigation }) => {
    const {
        topicTitle: sourceTopicTitle,
        topicDescription: sourceTopicDescription,
        formContext
    } = route.params || {};

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [message, setMessage] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');

    const showCourseSelector = formContext !== 'financial_literacy_contact';

    const courseOptions = [
        { label: 'Selecione um curso (opcional)...', value: '' },
        { label: 'Reparação de Computadores', value: 'reparacao_computadores' },
        { label: 'Formação em Design', value: 'formacao_design' },
        { label: 'Programação Web', value: 'programacao_web' },
        { label: 'Reparação de Electrónicos', value: 'reparacao_electronicos' },
        { label: 'Poupança', value: 'poupanca' },
    ];

    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !number.trim()) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha nome, email e número.');
            return;
        }
        if (showCourseSelector && !selectedCourse && formContext === 'course_inquiry') {
             Alert.alert('Campo Obrigatório', 'Por favor, selecione um curso.');
             return;
        }

        const recipientEmail = 'seu-email-de-destino@exemplo.com'; // <<-- IMPORTANTE: SUBSTITUA PELO SEU EMAIL
        let subject = `Contato via App TecMaia`;
        if (sourceTopicTitle) {
            subject = `Contato sobre: ${sourceTopicTitle}`;
        } else if (selectedCourse && showCourseSelector) {
            subject = `Inscrição/Interesse no Curso: ${courseOptions.find(c => c.value === selectedCourse)?.label}`;
        }

        let body = `Olá,\n\nUma nova solicitação foi recebida:\n\n`;
        if (sourceTopicTitle) {
            body += `Tópico de Interesse: ${sourceTopicTitle}\n`;
        }
        body += `Nome: ${name}\n`;
        body += `Email: ${email}\n`;
        body += `Número: ${number}\n`;

        if (selectedCourse && showCourseSelector) {
            const courseLabel = courseOptions.find(c => c.value === selectedCourse)?.label || 'N/A';
            body += `Curso Selecionado: ${courseLabel}\n`;
        }

        if (message.trim()) {
            body += `\nMensagem Adicional:\n${message}\n`;
        }
        body += `\nAtenciosamente,\nSistema TecMaia`;

        const encodedSubject = encodeURIComponent(subject);
        const encodedBody = encodeURIComponent(body);
        const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubject}&body=${encodedBody}`;

        try {
            const canOpen = await Linking.canOpenURL(mailtoUrl);
            if (canOpen) {
                await Linking.openURL(mailtoUrl);
                Alert.alert(
                    'Email Preparado',
                    'O seu aplicativo de e-mail foi aberto. Por favor, revise e envie.',
                    [
                        {
                            text: 'OK', onPress: () => {
                                setName(''); setEmail(''); setNumber(''); setMessage(''); setSelectedCourse('');
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Erro', 'Não foi possível abrir o aplicativo de e-mail. Verifique se você tem um cliente de e-mail configurado.');
            }
        } catch (error) {
            console.error('Erro ao tentar abrir mailto:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao tentar preparar o e-mail.');
        }
    };

    const buttonText = sourceTopicTitle ? 'Solicitar Contato' : 'Enviar Inscrição';

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F4F4F8" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color="#E83E8C" />
                        <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>

                    {sourceTopicTitle && (
                        <Text style={styles.pageHeaderTitle}>{sourceTopicTitle}</Text>
                    )}
                    {sourceTopicDescription && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>{sourceTopicDescription}</Text>
                        </View>
                    )}

                    <Text style={styles.formHeader}>Preencha para entrarmos em contato:</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome Completo:</Text>
                        <TextInput style={styles.input} placeholder="Seu nome" value={name} onChangeText={setName} placeholderTextColor="#999"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email:</Text>
                        <TextInput style={styles.input} placeholder="Seu email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999"/>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Número de Telefone:</Text>
                        <TextInput style={styles.input} placeholder="Seu número" value={number} onChangeText={setNumber} keyboardType="phone-pad" placeholderTextColor="#999"/>
                    </View>

                    {showCourseSelector && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Curso de Interesse (Opcional):</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={selectedCourse}
                                    onValueChange={(itemValue) => setSelectedCourse(itemValue)}
                                    style={styles.picker}
                                    dropdownIconColor="#E83E8C">
                                    {courseOptions.map((course) => (
                                        <Picker.Item key={course.value} label={course.label} value={course.value} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mensagem (Opcional):</Text>
                        <TextInput style={[styles.input, styles.textArea]} placeholder="Sua mensagem" value={message} onChangeText={setMessage} multiline numberOfLines={4} textAlignVertical="top" placeholderTextColor="#999"/>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
                        <Text style={styles.submitButtonText}>{buttonText}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F4F4F8' },
    scrollContainer: { flexGrow: 1, paddingBottom: 30 },
    container: { paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15 },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        alignSelf: 'flex-start',
        padding: 5, // Aumenta a área de toque
    },
    backButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#E83E8C',
        fontWeight: '600',
    },
    pageHeaderTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E83E8C',
        textAlign: 'center',
        marginBottom: 15,
    },
    descriptionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#444',
        textAlign: 'justify',
    },
    formHeader: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 15, color: '#333', marginBottom: 7, fontWeight: '500' },
    input: {
        backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 8,
        paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 14 : 11, fontSize: 16, color: '#333',
    },
    textArea: { minHeight: 100, paddingTop: Platform.OS === 'ios' ? 14 : 11 },
    pickerContainer: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, backgroundColor: '#FFFFFF' },
    picker: { color: '#333', height: Platform.OS === 'android' ? 50 : undefined, justifyContent: 'center' }, // ajuste para Android
    submitButton: {
        backgroundColor: '#E83E8C', paddingVertical: 15, borderRadius: 8,
        alignItems: 'center', marginTop: 10, elevation: 3,
    },
    submitButtonText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
});

export default ContactFormScreen;