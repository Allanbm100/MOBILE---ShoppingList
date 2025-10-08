import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { db } from '../config/firebase';
import { collection, getDocs, doc, addDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Dialog from 'react-native-dialog';

export default function HomeScreen () {
    const [productName, setProductName] = useState("");
    const [products, setProducts] = useState([]);
    const [visible, setVisible] = useState(false);
    const [selectedProductName, setSelectedProductName] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");

    const renderItem = ({ item }: { item: any }) => (
        <View style={ styles.itemContainer }>
            <Text style={ styles.itemText }>{item.name}</Text>
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
        try {
            const docRef = await addDoc(collection(db, "ShoppingList"), { name: productName });
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


    useEffect(() => {
        // fetchProducts();
        const unsubscribe = onSnapshot(collection(db, "ShoppingList"), (snapshot) => {
            const productsData = snapshot.docs.map( doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setProducts(productsData);
        })

        return () => unsubscribe();
    }, []);

    return (
        <View style={ styles.container }>
            <View style={ styles.formContainer }>
                <TextInput 
                    style={ styles.input } 
                    placeholder="Nome e quantidade do produto"
                    value={productName}
                    onChangeText={text => setProductName(text)}
                    underlineColorAndroid="transparent"
                    placeholderTextColor="#aaaaaa" 
                    autoCapitalize='none' 
                />
                <TouchableOpacity style={ styles.button } onPress={addProduct}>
                    <Text style={ styles.buttonText }>Adicionar</Text>
                </TouchableOpacity>
            </View>
            {products.length > 0 && (
                <View style={styles.listContainer }>
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
    }
});