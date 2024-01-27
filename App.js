import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "32dad2b593f61a971533e476dbd6464e";

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Rain: "rain",
  Thunderstorm: "lightning",
  Drizzle: "rain",
  Snow: "snow",
  Atmosphere: "fog",
};

export default function App() {
  const [city, setCity] = useState("LOADING");
  const [address, setAddress] = useState("");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);

  const ask = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setOk(false);
    }

    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    // 위도 / 경도로 위치 찾기
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false },
    );

    setCity(location[0].region);
    setAddress(location[0].formattedAddress);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
    );
    const json = await response.json();

    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes("03:00:00")) {
          return weather;
        }
      }),
    );
  };

  useEffect(() => {
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
        <Text style={styles.address}>{address}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.weather}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {days.length === 0 ? (
          <View style={{ width: SCREEN_WIDTH, alignItems: "center" }}>
            <ActivityIndicator
              color={"black"}
              style={{ marginTop: 10 }}
              size={80}
            />
          </View>
        ) : (
          days.map((day, index) => {
            return (
              <View style={styles.day} key={`dayKey${index}`}>
                <Text style={styles.date}>
                  {new Date(day.dt * 1000)
                    .toISOString()
                    .substring(5, 10)
                    .replace("-", "월 ") + "일"}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.temp}>{day.main.temp.toFixed(1)}</Text>
                  <Text style={styles.tempUnit}>&nbsp;℃</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    alignContent: "center",
                  }}
                >
                  <Text style={styles.weatherName}>{day.weather[0].main}</Text>
                  <Fontisto
                    name={icons[day.weather[0].main]}
                    size={40}
                    color="black"
                    style={{ marginTop: -10 }}
                  />
                </View>
                <Text style={styles.description}>
                  {day.weather[0].description}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
  },
  city: {
    flex: 0.5,
    marginVertical: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 48,
    fontWeight: "500",
  },
  address: {
    marginTop: 10,
    fontSize: 15,
  },
  day: {
    width: SCREEN_WIDTH - 40,
    marginLeft: 40,
  },
  date: {
    fontSize: 40,
    fontWeight: "400",
  },
  temp: {
    fontSize: 108,
    marginTop: -20,
    marginLeft: -10,
  },
  tempUnit: {
    fontSize: 80,
  },
  weatherName: {
    fontSize: 40,
    marginTop: -20,
    fontWeight: "300",
  },
  description: {
    fontSize: 30,
    fontWeight: "200",
  },
});
