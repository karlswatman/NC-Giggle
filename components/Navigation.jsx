import React, { useContext, useEffect, useState } from "react";
import GigScreen from "./GigScreen";
import ErrorScreen from "./ErrorScreen";
import Profile from "./Profile";
import Chats from "./Chats";
import { createDrawerNavigator } from "@react-navigation/drawer";
import UserProfile from "./UserProfile";
import { getGigsForHomePage } from "../utils/api";
import {
	View,
	Button,
	Text,
	StyleSheet,
	Modal,
	Pressable,
	Dimensions,
	Image,
} from "react-native";
import { PickerIOS } from "@react-native-picker/picker";
import { UserContext } from "../context/context";

import ChatsList from "./ChatsList";
import { TextInput } from "react-native-gesture-handler";
import { getUserInfo } from "../firebase";
import CustomDrawer from "./CustomDrawer";
import Ionicons from "react-native-vector-icons/Ionicons";

const Drawer = createDrawerNavigator();

const DrawerNavigation = ({ navigation, route }) => {
	const { userParams } = useContext(UserContext);
	const [modalVisible, setModalVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [genreValue, setGenreValue] = useState("");
	const [sortByValue, setSortByValue] = useState("date,asc");
	const [userCity, setUserCity] = useState("");
	const [initialCity, setInitialCity] = useState(userParams.city);
	const [initialGenre, setInitialGenre] = useState(userParams.genre);
	const [gigs, setGigs] = useState([{}]);
	const [genres, setGenres] = useState([
		{ value: "KnvZfZ7vAvv", label: "Alternative" },
		{ value: "KnvZfZ7vAve", label: "Ballads/Romantic" },
		{ value: "KnvZfZ7vAvd", label: "Blues" },
		{ value: "KnvZfZ7vAvA", label: "Chanson Francais" },
		{ value: "KnvZfZ7vAvk", label: "Children's Music" },
		{ value: "KnvZfZ7vAeJ", label: "Classical" },
		{ value: "KnvZfZ7vAv6", label: "Country" },
		{ value: "KnvZfZ7vAvF", label: "Dance/Electronic" },
		{ value: "KnvZfZ7vAva", label: "Folk" },
		{ value: "KnvZfZ7vAv1", label: "Hip-Hop/Rap" },
		{ value: "KnvZfZ7vAvE", label: "Jazz" },
		{ value: "KnvZfZ7vAJ6", label: "Latin" },
		{ value: "KnvZfZ7vAvI", label: "Medieval/Renaissance" },
		{ value: "KnvZfZ7vAvt", label: "Metal" },
		{ value: "KnvZfZ7vAvn", label: "New Age" },
		{ value: "KnvZfZ7vAvl", label: "Other" },
		{ value: "KnvZfZ7vAev", label: "Pop" },
		{ value: "KnvZfZ7vAee", label: "R&B" },
		{ value: "KnvZfZ7vAed", label: "Reggae" },
		{ value: "KnvZfZ7vAe7", label: "Religious" },
		{ value: "KnvZfZ7vAeA", label: "Rock" },
		{ value: "KnvZfZ7vAeF", label: "World" },
	]);
	const [sort, setSort] = useState([
		{ value: "date,asc", label: "Date Ascending" },
		{ value: "date,desc", label: "Date Descending" },
		{ value: "name,asc", label: "Name Ascending" },
		{ value: "name,desc", label: "Name Descending" },
		{ value: "venueName,asc", label: "Venue Name Ascending" },
		{ value: "venueName,desc", label: "Venue Name Descending" },
		{ value: "random", label: "Random" },
	]);

	const filter = () => {
		getGigsForHomePage(genreValue, sortByValue, userCity).then((results) => {
			setGigs(results);
			setModalVisible(!modalVisible);
		});
	};
	useEffect(() => {
		getUserInfo().then((user) => {
			if (user) {
				setUserCity(user.city);
				setInitialCity(user.city);
				setInitialGenre(user.genrePrefrences[0]);
			}
			getGigsForHomePage(initialGenre, sortByValue, initialCity).then(
				(results) => {
					setGigs(results);
				}
			);
		});
		setIsLoading(false);
	}, [initialCity]);
	if (isLoading) {
		return <Text>Loading</Text>;
	}
	return (
		<>
			<Drawer.Navigator
				drawerContent={(props) => <CustomDrawer {...props} />}
				initialRouteName="Home"
				screenOptions={{
					drawerActiveBackgroundColor: "#577BC1",
					drawerActiveTintColor: "#EBE645",
					drawerLabelStyle: {
						color: "#fff",
					},
					headerStyle: { backgroundColor: "#344CB7" },
					headerTintColor: "#fff",
				}}
			>
				{gigs ? (
					<Drawer.Screen
						name="Home"
						children={() => <GigScreen events={gigs} />}
						options={{
							headerTitle: "Gigs",
							drawerIcon: () => (
								<Ionicons name="home-outline" size={22} color={"#EBE645"} />
							),
							headerRight: () => (
								<>
									<>
										<Button
											onPress={() => setModalVisible(!modalVisible)}
											title="Filter"
											color="#577BC1"
										/>
									</>
								</>
							),
						}}
					/>
				) : (
					<Drawer.Screen
						name="Home"
						component={ErrorScreen}
						options={{
							headerTitle: "Gigs",
							headerRight: () => (
								<>
									<>
										<Button
											onPress={() => setModalVisible(!modalVisible)}
											title="Filter"
											color="gray"
										/>
									</>
								</>
							),
						}}
					/>
				)}
				<Drawer.Screen
					name="Profile"
					component={UserProfile}
					options={{
						drawerIcon: () => (
							<Ionicons name="person-outline" size={22} color={"#EBE645"} />
						),
					}}
					initialParams={route.params}
				/>
				{/* <Drawer.Screen name="Chatroom" component={Chats} /> */}
				<Drawer.Screen
					name="Crowds"
					component={ChatsList}
					options={{
						drawerIcon: () => (
							<Ionicons name="chatbox-ellipses-outline" size={22} color={"#EBE645"} />
						),
					}}
				/>
			</Drawer.Navigator>
			<View>
				<Modal visible={modalVisible} animationType="slide">
					<View style={styles.container}>
						<Image
							source={require("../images/3.png")}
							style={{ width: 375, height: 200 }}
						></Image>
						<Text style={styles.text}>Select a genre:</Text>
						<PickerIOS
							itemStyle={styles.picker}
							selectedValue={genreValue}
							onValueChange={(itemValue) => setGenreValue(itemValue)}
						>
							{genres.map((genre) => {
								return (
									<PickerIOS.Item
										key={genre.value}
										value={genre.value}
										label={genre.label}
									/>
								);
							})}
						</PickerIOS>
						<Text style={styles.text}>City:</Text>
						<TextInput
							style={styles.input}
							defaultValue={userCity}
							onChangeText={(city) => setUserCity(city)}
						/>
						<Text style={styles.text}>Sort By:</Text>
						<PickerIOS
							itemStyle={styles.picker}
							selectedValue={sortByValue}
							onValueChange={(itemValue) => setSortByValue(itemValue)}
						>
							{sort.map((sortBy) => {
								return (
									<PickerIOS.Item
										key={sortBy.value}
										value={sortBy.value}
										label={sortBy.label}
									/>
								);
							})}
						</PickerIOS>

						<Pressable
							style={styles.button}
							onPress={() => {
								filter();
							}}
						>
							<Text style={styles.text}>Apply</Text>
						</Pressable>
					</View>
				</Modal>
			</View>
		</>
	);
};
const styles = StyleSheet.create({
	container: {
		backgroundColor: "#000957",
		flex: 1,
		justifyContent: "center",
		alignItems: "flex-start",
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height,
	},
	text: {
		fontSize: 24,
		fontWeight: "700",
		color: "#EBE645",
	},
	button: {
		position: "relative",
		bottom: 0,
		backgroundColor: "#577BC1",
		alignItems: "center",
		fontSize: 16,
		padding: 5,
		elevation: 2,
		width: Dimensions.get("window").width,
	},
	input: {
		marginBottom: 30,
		backgroundColor: "#577BC1",
		color: "#EBE645",
		fontSize: 24,
		height: 40,
		width: Dimensions.get("window").width,
	},
	picker: {
		marginBottom: 30,
		// backgroundColor: "#577BC1",
		color: "#fff",
		fontSize: 24,
		height: 100,
		width: Dimensions.get("window").width,
	},
});
export default DrawerNavigation;
