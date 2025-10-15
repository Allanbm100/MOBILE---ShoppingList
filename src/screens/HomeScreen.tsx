import { useEffect, useState, useLayoutEffect } from 'react';
import { Button, FlatList, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db, storage } from '../config/firebase';
import { collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Dialog from 'react-native-dialog';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import { Image } from 'expo-image'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

export default function HomeScreen({ navigation }: { navigation: any }) {
    const [productName, setProductName] = useState("");
    const [products, setProducts] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedProductName, setSelectedProductName] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");

    const [showImage, setShowImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.itemContainer}>
            <Pressable onPress={() => presentImage(item.image)}>
                <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 6 }} />
            </Pressable>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity onPress={() => showDialog(item)}>
                <MaterialIcons name="edit" size={24} color="#6565cfff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteProduct(item.id)}>
                <MaterialIcons name="delete" size={24} color="#da6363ff" />
            </TouchableOpacity>
        </View>
    )

    // const fetchProducts = async () => {
    //     try {
    //         const querySnapshot = await getDocs(collection(db, "ShoppingList"));

    //         const productsData = querySnapshot.docs.map( doc => ({
    //             id: doc.id,
    //             ...doc.data()
    //         }))

    //         setProducts(productsData);

    //     } catch (error) {
    //         console.log("Erro ao buscar produtos: ", error);
    //     }
    // }

    const addProduct = async () => {
        if (productName.trim() === "") {
            setProductName("");
            return;
        }
        const uri = await pickMedia();
        try {
            var imageUri = null;
            if (uri) {
                const fileName = uri.split("/").pop();

                const compressedUri = await compressImage(uri);
                imageUri = await uploadMediaAsync(compressedUri, `uploads/${fileName}`);

            };
            const docRef = await addDoc(collection(db, "ShoppingList"), { name: productName, image: imageUri });
            // setProducts(prev => [...prev, { id: docRef.id, name: productName }]);
            setProductName("");
        } catch (error) {
            console.log("Erro ao adicionar produto: ", error);
        }
    }

    const deleteProduct = async (id: string) => {
        try {
            await deleteDoc(doc(db, "ShoppingList", id));
            // setProducts(prev => prev.filter((product: any) => product.id !== id));
        } catch (error) {
            console.log("Erro ao deletar produto: ", error);
        }
    }

    const updateProduct = async (id: string, newName: string) => {
        try {
            await updateDoc(doc(db, "ShoppingList", id), { name: newName });
        } catch (error) {
            console.log("Erro ao atualizar produto: ", error);
        }
    }

    const showDialog = (product: any) => {
        setVisible(true);
        setSelectedProductName(product.name);
        setSelectedProductId(product.id);
    }

    const handleUpdate = () => {
        updateProduct(selectedProductId, selectedProductName);
        setVisible(false);
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.log("Erro ao sair: ", error);

        }
    }

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 1,
            //allowsEditing: true (Caso o usuário possa editar a edição da imagem)
        });
        if (!result.canceled) return result.assets[0].uri;
        else return null;
    }

    const compressImage = async (uri:string) => {
        const manipulated = await manipulateAsync(
            uri,
            [{ resize: { width: 400 } }],
            { compress: 0.6, format: SaveFormat.WEBP }
        );
        return manipulated.uri;
    }

    const uploadMediaAsync = async (uri: string, path: string) => {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, blob);

        const downloadURL = await getDownloadURL(fileRef);
        return downloadURL;
    }

    const presentImage = (image: any) => {
        if (image) {
            setSelectedImage(image);
            setShowImage(true);
        }
    }

    useEffect(() => {
        // fetchProducts();
        const unsubscribe = onSnapshot(collection(db, "ShoppingList"), (snapshot) => {
            const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setProducts(productsData);
        })

        return () => unsubscribe();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Button title='Sair' onPress={handleLogout} />
            )
        });
    });

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nome e quantidade do produto"
                    value={productName}
                    onChangeText={text => setProductName(text)}
                    underlineColorAndroid="transparent"
                    placeholderTextColor="#aaaaaa"
                    autoCapitalize='none'
                />
                <TouchableOpacity style={styles.button} onPress={addProduct}>
                    <Text style={styles.buttonText}>Adicionar</Text>
                </TouchableOpacity>
            </View>
            {products.length > 0 && (
                <View style={styles.listContainer}>
                    <FlatList data={products} renderItem={renderItem} keyExtractor={item => item.id} removeClippedSubviews={true} />
                </View>
            )}

            <Dialog.Container visible={visible}>
                <Dialog.Title>Atualizar Produto</Dialog.Title>
                <Dialog.Description>Digite o novo nome/quantidade do produto</Dialog.Description>
                <Dialog.Input placeholder='Digite aqui' value={selectedProductName} onChangeText={setSelectedProductName} />
                <Dialog.Button label="Cancelar" onPress={() => setVisible(false)} />
                <Dialog.Button label="Atualizar" onPress={handleUpdate} />
            </Dialog.Container>

            {showImage && (
                <Pressable onPress={() => setShowImage(false)} style={ styles.overlay }>
                    <Image source={{uri: selectedImage }} style={ styles.fullImage } contentFit='contain' />
                </Pressable>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    formContainer: {
        flexDirection: 'row',
        margin: 20,
        justifyContent: "center",
        alignItems: "center",
        gap: 10
    },
    input: {
        height: 48,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
        paddingLeft: 16,
        flex: 1,
        marginRight: 5,
    },
    button: {
        height: 48,
        borderRadius: 5,
        backgroundColor: '#788eec',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        marginHorizontal: 8,
    },
    listContainer: {
        paddingHorizontal: 20,
        flex: 1,
        width: '100%',
    },
    itemContainer: {
        marginTop: 16,
        borderBottomColor: '#cccccc',
        borderBottomWidth: 1,
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        gap: 5
    },
    itemText: {
        fontSize: 16,
        color: '#333333',
        width: '100%',
        flex: 1,
    },
    fullImage: {
        width: '90%',
        height: '80%',
        borderRadius: 10
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignContent: 'center'
    },
});