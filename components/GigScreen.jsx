import React, { useEffect } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	LayoutAnimation,
	Platform,
	Button,
	Linking

} from "react-native";
import { useState } from "react";
import { getGigsForHomePage } from "../utils/api";

import { addUserToChatGroup, createChatGroup, getChatsForUser } from "../firebase-sw-messaging";

function AppBtn({ onPress, title, clickedBtn, btnId, setClickedBtn }){
	React.useEffect(() => {
		getChatsForUser().then((result) => {
			for (let i = 0; i < result.length; i++) {
				if (result[i].id + "btn" === btnId) {
					setClickedBtn(true);
				}
			}
		});
	}, []);
	return (
	<TouchableOpacity onPress={onPress} style={clickedBtn ? styles.clickedAppBtnContainer: styles.appButtonContainer }>
	  <Text style={styles.appButtonText}>{clickedBtn ? "Interested" : title}</Text>
	</TouchableOpacity>
)};

const ExpandableComponent = ({ item, onClickFunction }) => {
	const [layoutHeight, setLayOutHeight] = useState(0);
	const [clickedBtn, setClickedBtn] = useState(false);

  useEffect(() => {
    if (item.isExpanded) {
      setLayOutHeight(null);
    } else {
      setLayOutHeight(0);
    }
  }, [item.isExpanded]);



	return (
		<View key={item.id}>
			<TouchableOpacity style={styles.item} onPress={onClickFunction}>
				<Text style={styles.itemText}>{item.category_name}</Text>
					<Image source={{ uri: item.image }} style={{ width: 375, height: 200 }} />				
			</TouchableOpacity>
			<View
				style={{
					height: layoutHeight,
					overflow: "hidden",
				}}
			>
				{item.subcategory.map((value) => {
					return (
						<TouchableOpacity key={value.val} style={styles.content}>
							<Text style={styles.text}>{value.val}</Text>
							<View style={styles.seperator} />
						</TouchableOpacity>
					);
				})}
				<AppBtn clickedBtn={clickedBtn} setClickedBtn={setClickedBtn} btnId={item.id+"btn"}
			 		key={item.id+"btn"}
					title="sign up to gig chatroom"
					onPress={() => {
						setClickedBtn(true);
						createChatGroup(
							item.id,
							item.category_name,
							item.subcategory[0].val,
							item.subcategory[2].val,
							item.image,
							item
						).then(() => {
							addUserToChatGroup(item.id);
						});
					}}
				/>
			</View>
		</View>
	);

};

const selectBestImage = (imageList) => {
	const imageCandidates = imageList.filter((image) => { return image.width > 375} );
	if(imageCandidates.length > 0) {
		return 	imageList.filter((image) => { return image.width > 375} )[0].url;
	} else {
		return "https://cdn.pixabay.com/photo/2013/07/12/18/53/ticket-153937_960_720.png"
	}
}

export default function GigScreen(props) {
  const [multiSelect, setMultiSelect] = useState(false);
  const [listDataSource, setListDataSource] = useState([
    {
      isExpanded: false,
      category_name: "item 1",
      subcategory: [{ id: 1, val: "Sub 1" }],
    },
  ]);


  const contentFormat = (results) => {
    return results.map((gig) => {
      if (gig.images !== undefined) {
        return {
          isExpanded: false,
          category_name: gig.name,
          id: gig.id,
          image: selectBestImage(gig.images),
          subcategory: [
            { val: gig.dates.start.localDate },
            { val: gig.dates.status.code },
            { val: gig._embedded.venues[0].name },
          ],
        };
      } else {
        return {
          isExpanded: false,
          category_name: "",
          id: "",
          image: "",
          subcategory: [{ val: "" }, { val: "" }, { val: "" }],
        };
      }
    });
  };

  const updateLayout = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...listDataSource];
    if (multiSelect) {
      //If multiple select is enabled
      array[index]["isExpanded"] = !array[index]["isExpanded"];
    } else {
      //If single select is enabled
      array.map((value, placeindex) => {
        return placeindex === index
          ? (array[placeindex]["isExpanded"] = !array[placeindex]["isExpanded"])
          : (array[placeindex]["isExpanded"] = false);
      });
    }
    setListDataSource(array);
  };

  useEffect(() => {
    let newContentFormat = contentFormat(props.events);
    setListDataSource(newContentFormat);
    // console.log("gigscreen");
  }, [props.events]);
  //   console.log(listDataSource);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Gig List</Text>
          <TouchableOpacity onPress={() => setMultiSelect(!multiSelect)}>
            <Text style={styles.headerBtn}>
              {multiSelect
                ? "Multiple selector\n Enabled"
                : "Single selector\n Enabled"}
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {/* {console.log("render")} */}
          {listDataSource.map((item, key) => {
            return (
              <ExpandableComponent
                key={key.toString()}
                item={item}
                onClickFunction={() => {
                  updateLayout(key);
                }}
              />
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
	header: {
		flexDirection: "row",
		padding: 10,
	},
	titleText: {
		flex: 1,
		fontWeight: "bold",
	},
	headerBtn: {
		textAlign: "center",
		justifyContent: "center",
		color: "red"
	},
	item: {
		backgroundColor: "orange",
		padding: 20,
	},
	itemText: {
		fontWeight: "500",
	},
	content: {
		paddingLeft: 10,
		paddingRight: 10,
		backgroundColor: "#fff",
	},
	text: {
		padding: 10,
	},
	seperator: {
		height: 0.5,
		backgroundColor: "#c8c8c8",
		width: "100%",
	},
	gigContainer: {
		flexGrow: 0,
	},
	gigCard: {
		flexGrow: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	gigInfo: {
		fontWeight: "700",
	},
	gigInfoBody: {
		lineHeight: 15 * 1.5,
		textAlign: "center",
		marginTop: 20,
	},
	appButtonContainer: {
		elevation: 8,
		backgroundColor: "blue",
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 12
	  },
	  appButtonText: {
		fontSize: 18,
		color: "#fff",
		fontWeight: "bold",
		alignSelf: "center",
		textTransform: "uppercase"
	  },
	  clickedAppBtnContainer: {
		elevation: 8,
		backgroundColor: "red",
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 12 
	  },
});
