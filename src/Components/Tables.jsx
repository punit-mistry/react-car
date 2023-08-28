import React, { useState, useEffect } from "react";
import axios from "axios";

const Tables = () => {
  const [ApiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [AllFilter, setAllFilter] = useState({
    departure: false,
    AtUnloading: false,
    Available: false,
  });

  const FetchData = () => {
    setLoading(true);
    let config = {
      method: "get",
      maxBodyLength: Infinity,
      url: import.meta.env.VITE_API_URL,
      headers: {
        Authorization: import.meta.env.VITE_API_TOKEN,
      },
    };

    axios
      .request(config)
      .then((response) => {
        setApiData(response.data.data.records["NO GROUPING"]);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    FetchData();
  }, []);

  const toggleNullDepartures = () => {
    setAllFilter({ ...AllFilter, departure: !AllFilter.departure });
  };
  const toggleNullAtUnloading = () => {
    setAllFilter({ ...AllFilter, AtUnloading: !AllFilter.AtUnloading });
  };
  const toggleNullAvailable = () => {
    setAllFilter({ ...AllFilter, Available: !AllFilter.Available });
  };
  const toggleNullReset = () => {
    setAllFilter({
      departure: false,
      AtUnloading: false,
      Available: false,
    });
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  currentDate.setHours(12, 0, 0, 0);
  const timestamp = currentDate.getTime();

  const filteredData = ApiData.filter((res) => {
    if (
      AllFilter.AtUnloading &&
      res.status == "At delivery" &&
      res?.destination?.status === "AT" &&
      res?.destination?.arrivalTime < timestamp
    ) {
      console.log("At delivery:", res.status, timestamp);
      return true;
    } else if (
      AllFilter.Available &&
      res.status === "Available" &&
      res.currentTripPoint?.actualArrival < timestamp
    ) {
      return true;
    } else if (
      AllFilter.departure &&
      res.status === "At pickup" &&
      !res?.origin?.departureTime
    ) {
      return true;
    } else if (
      !AllFilter.AtUnloading &&
      !AllFilter.departure &&
      !AllFilter.Available
    ) {
      return true;
    }
    return false;
  });

  return (
    <div>
      <div className="flex flex-wrap justify-center md:justify-start  gap-5 p-5 bg-black font-bold text-white md:flex-row">
        <button
          onClick={toggleNullDepartures}
          className={`${
            AllFilter.departure ? "bg-green-500" : "bg-red-500"
          } w-40 md: p-2 rounded-lg hover:outline transition-all `}
        >
          Departure Left
        </button>
        <button
          onClick={toggleNullAtUnloading}
          className={`${
            AllFilter.AtUnloading ? "bg-green-500" : "bg-red-500"
          }   w-40 p-2 rounded-lg hover:outline transition-all`}
        >
          Atunloading{" "}
        </button>
        <button
          onClick={toggleNullAvailable}
          className={`${
            AllFilter.Available ? "bg-green-500" : "bg-red-500"
          }  w-40  p-2 rounded-lg hover:outline transition-all`}
        >
          Available{" "}
        </button>
        <button
          onClick={toggleNullReset}
          className={`${
            !AllFilter.Available &&
            !AllFilter.AtUnloading &&
            !AllFilter.departure
              ? "bg-green-500"
              : "bg-red-500"
          }   w-40 p-2 rounded-lg hover:outline transition-all`}
        >
          Reset{" "}
        </button>
        <input
          disabled
          value={filteredData.length}
          className="text-white p-2 rounded-lg "
        />
      </div>
      {loading && (
        <div className="bg-black h-screen text-white flex flex-col text-4xl justify-center items-center">
          <div class="lds-ripple">
            <div></div>
            <div></div>
          </div>{" "}
          Loading
        </div>
      )}
      {!loading && (
        <>
          <div>
            <table className="w-screen text-center max-w-screen text-sm md:text-base ">
              <thead>
                <tr className="h-8 md:h-10 sticky top-0 bg-yellow-400">
                  <th>Status</th>
                  <th>VNumber</th>
                  <th>VType</th>
                  <th>Departure</th>
                  <th>Aviable</th>
                  <th>AtUnloading</th>
                  <th>Current Branch</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((res, index) => (
                  <tr
                    key={index}
                    className="h-5  md:h-10 border-b-2 hover:bg-slate-200"
                  >
                    <td>{res.status}</td>
                    <td>{res.vehicle.vehicleRegistrationNumber}</td>
                    <td>
                      {res.vehicle.customFields.map((res) =>
                        res.fieldKey === "VehicleDescription" ? res.value : ""
                      )}
                    </td>
                    <td>
                      {" "}
                      {res?.origin?.departureTime
                        ? new Date(res?.origin?.departureTime).toISOString()
                        : "--"}
                    </td>
                    <td>
                      {res.currentTripPoint?.actualArrival
                        ? new Date(
                            res.currentTripPoint?.actualArrival
                          ).toISOString()
                        : "--"}
                    </td>
                    <td>
                      {res?.destination?.status == "AT"
                        ? new Date(res.destination?.arrivalTime).toISOString()
                        : "-- "}
                    </td>
                    <td>{res?.currentHub}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow"
            >
              Scroll to Top
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Tables;
