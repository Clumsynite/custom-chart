import React, { useState, useEffect } from "react";
import moment from "moment";
import _ from "lodash";
import { Select, Button } from "antd";
import "antd/lib/select/style/css";
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
const { Option } = Select;

export default function CustomChart() {
  const [stageDuration] = useState({
    GM: 3,
    TPnGR: 7,
    GRnH: 10,
    TA: 2,
    total: 22,
  });

  const [sectionIntervals] = useState({ inter: 10, intra: 19 });

  const [sectionDetails] = useState({
    GM: { startDate: moment() },
  });

  const [sectionAndCycle] = useState({ section: 1, cycle: 3 });

  const [mappedSectionData, setMappedSectionData] = useState([]);

  const [stageColors] = useState({
    GM: `#FFCC00`,
    TPnGR: `#c6e0b4`,
    GRnH: `red`,
    TA: `yellow`,
  });

  const [numberOfYears] = useState(5);

  const [currentYear, setCurrentYear] = useState(moment().year());

  const [size, setSize] = useState(17);

  const calculateStageWeeks = (startDate) => {
    let stages = {
      GM: { startDate },
    };
    let GMendDate = moment(startDate).add(_.get(stageDuration, "GM") - 1, "w");
    _.set(stages, "GM.endDate", GMendDate);
    _.set(stages, "TPnGR.startDate", moment(GMendDate).add(1, "w"));
    let TPnGRendDate = moment(_.get(stages, "TPnGR.startDate")).add(
      _.get(stageDuration, "TPnGR") - 1,
      "w"
    );
    _.set(stages, "TPnGR.endDate", TPnGRendDate);
    _.set(stages, "GRnH.startDate", moment(TPnGRendDate).add(1, "w"));
    let GRnHendDate = moment(_.get(stages, "GRnH.startDate")).add(
      _.get(stageDuration, "GRnH") - 1,
      "w"
    );
    _.set(stages, "GRnH.endDate", GRnHendDate);
    _.set(stages, "TA.startDate", moment(GRnHendDate).add(1, "w"));
    _.set(
      stages,
      "TA.endDate",
      moment(_.get(stages, "TA.startDate")).add(
        _.get(stageDuration, "TA") - 1,
        "w"
      )
    );
    return stages;
  };

  const mapSectionDetails = () => {
    let cycleCount = sectionAndCycle.cycle;
    let sectionCount = sectionAndCycle.section;
    let array = [];
    for (let cycleId = 0; cycleId < cycleCount; cycleId++) {
      let cycleObject = {};
      _.set(cycleObject, "cycle", cycleId + 1);
      for (let sectionId = 0; sectionId < sectionCount; sectionId++) {
        _.set(cycleObject, "section", String.fromCharCode(cycleId + 1 + 64));
        let sec1 = [],
          sec2 = [],
          finalYear = moment().add(numberOfYears, "y").year();
        if (cycleId < 1) {
          sec1.push(
            calculateStageWeeks(moment(_.get(sectionDetails, "GM.startDate")))
          );
          sec2.push(
            calculateStageWeeks(
              moment(_.get(sectionDetails, "GM.startDate")).add(
                _.get(sectionIntervals, "intra"),
                "w"
              )
            )
          );
          for (let i = 0; i < numberOfYears * 3; i++) {
            let init1 = moment(_.get(sec2[i], "TA.endDate")).subtract(2, "w");
            let init2 = moment(_.get(sec1[i], "TA.endDate")).subtract(2, "w");
            let firstRow = calculateStageWeeks(init1);
            let secRow = calculateStageWeeks(init2);
            if (
              moment(firstRow.TA.endDate).year() < finalYear &&
              moment(secRow.TA.endDate).year() < finalYear
            ) {
              sec1.push(firstRow);
              sec2.push(secRow);
            } else {
              break;
            }
          }
        } else {
          sec1.push(
            calculateStageWeeks(
              moment(_.get(sectionDetails, "GM.startDate")).add(
                cycleId * _.get(sectionIntervals, "inter"),
                "w"
              )
            )
          );
          sec2.push(
            calculateStageWeeks(
              moment(_.get(sec1[0], "GM.startDate")).add(
                _.get(sectionIntervals, "intra"),
                "w"
              )
            )
          );
          for (let i = 0; i < numberOfYears * 3; i++) {
            let init1 = moment(_.get(sec2[i], "TA.endDate")).subtract(2, "w");
            let init2 = moment(_.get(sec1[i], "TA.endDate")).subtract(2, "w");
            let firstRow = calculateStageWeeks(init1);
            let secRow = calculateStageWeeks(init2);
            if (
              moment(firstRow.TA.endDate).year() < finalYear &&
              moment(secRow.TA.endDate).year() < finalYear
            ) {
              sec1.push(firstRow);
              sec2.push(secRow);
            } else {
              break;
            }
          }
        }
        _.set(cycleObject, "data", [sec1, sec2]);
        array.push(cycleObject);
      }
    }
    setMappedSectionData([...mappedSectionData, ...array]);
  };

  useEffect(() => {
    mapSectionDetails();
    // eslint-disable-next-line
  }, []);

  const Legend = () => {
    return (
      <div
        style={{
          ...flexCol,
          padding: "1px 10px",
          alignItems: "flex-start",
          border: `1px solid black`,
          marginLeft: 10,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: "bold", padding: "10px 0" }}>
          Legend
        </div>
        <div
          style={{ ...flexRow, padding: "6px 0" }}
          title={`${_.get(stageDuration, "GM")} Weeks`}
        >
          <div
            style={{
              ...legendColorStyle,
              marginRight: 4,
              backgroundColor: _.get(stageColors, "GM"),
            }}
          ></div>
          <div>GM</div>
        </div>
        <div
          style={{ ...flexRow, padding: "6px 0" }}
          title={`${_.get(stageDuration, "TPnGR")} Weeks`}
        >
          <div
            style={{
              ...legendColorStyle,
              marginRight: 4,
              backgroundColor: _.get(stageColors, "TPnGR"),
            }}
          ></div>
          <div>TPnGR</div>
        </div>
        <div
          style={{ ...flexRow, padding: "6px 0" }}
          title={`${_.get(stageDuration, "GRnH")} Weeks`}
        >
          <div
            style={{
              ...legendColorStyle,
              marginRight: 4,
              backgroundColor: _.get(stageColors, "GRnH"),
            }}
          ></div>
          <div>GRnH</div>
        </div>
        <div
          style={{ ...flexRow, padding: "6px 0" }}
          title={`${_.get(stageDuration, "TA")} Weeks`}
        >
          <div
            style={{
              ...legendColorStyle,
              marginRight: 4,
              backgroundColor: _.get(stageColors, "TA"),
            }}
          ></div>
          <div>TA</div>
        </div>
      </div>
    );
  };

  const WeekBoxes = ({ data, count }) => {
    const border = `1px solid #000`;
    const boxArray = _.times(52, Number);
    const boxStyle = {
      width: size,
      height: size,
      ...flexCol,
      borderLeft: border,
      borderRight: border,
      textAlign: "center",
      fontFamily: "sans-serif",
      boxShadow: "0 0 0 1px black",
      padding: 2,
      fontSize: 12,
    };
    const getBGColor = (index, stages, bg) => {
      const { GM, TPnGR, GRnH, TA } = stageColors;
      let backgroundColor = `#fff`;
      _.mapKeys(stages, (dates, stage) => {
        const { startDate, endDate } = dates;
        let start = moment(startDate).weeks();
        let end = moment(endDate).weeks();
        if (moment(startDate).year() > currentYear) {
          start += 52;
        } else if (
          moment(startDate).year() < currentYear &&
          moment(endDate).year() === currentYear
        ) {
          start -= 52;
        } else if (
          moment(startDate).year() === currentYear &&
          moment(endDate).year() > currentYear
        ) {
          end += 52;
        } else if (moment(startDate).year() < currentYear) {
          end -= 52;
        }
        switch (stage) {
          case "GM":
            if (index >= start && index <= end) return (backgroundColor = GM);
            break;
          case "TPnGR":
            if (index >= start && index <= end)
              return (backgroundColor = TPnGR);
            break;
          case "GRnH":
            if (index >= start && index <= end) {
              return (backgroundColor = GRnH);
            }
            break;
          case "TA":
            if (index >= start && index <= end) return (backgroundColor = TA);
            break;
          default:
            break;
        }
      });
      return backgroundColor;
    };
    return (
      <div style={{ ...flexRow }}>
        {_.map(boxArray, (week, index) => {
          let backgroundColor = count ? "#d9e1f2" : "#fff";
          if (data) {
            for (let stage of data) {
              let bg = backgroundColor;
              backgroundColor = getBGColor(index + 1, stage, bg);
              if (
                (bg !== "#fff" || bg !== "#d9e1f2") &&
                (backgroundColor === "#fff" || backgroundColor === "#d9e1f2")
              ) {
                backgroundColor = bg;
              }
            }
          }
          return (
            <div
              style={{
                ...boxStyle,
                backgroundColor,
              }}
              key={index}
            >
              {count && week + 1}
            </div>
          );
        })}
      </div>
    );
  };

  const RenderWeekBoxes = () => {
    return mappedSectionData.map((sectionData, index) => {
      return (
        <div style={{ ...flexRow, padding: "5px 0" }} key={index}>
          <div style={labelStyle}>{`Section ${sectionData.section}`}</div>
          <div style={{ ...flexCol }}>
            {_.get(sectionData, "data", []).map((data, index) => {
              return <WeekBoxes data={data} key={index} />;
            })}
          </div>
        </div>
      );
    });
  };

  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <div
        style={{
          padding: "10px 0",
          ...flexRow,
          justifyContent: "space-between",
        }}
      >
        <Select
          defaultValue={moment().year()}
          style={{ width: 120 }}
          onChange={setCurrentYear}
        >
          {_.times(numberOfYears, Number).map((year) => (
            <Option value={moment().add(year, "y").year()} key={year}>
              Year {year + 1}
            </Option>
          ))}
        </Select>
        <div
          style={{
            ...flexRow,
            justifyContent: "space-around",
            padding: "10px 0",
            minWidth: 120,
          }}
        >
          <Button
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={() => setSize(size - 1)}
          />
          <div>Size: {size}</div>
          <Button
            size="small"
            icon={<ZoomInOutlined />}
            onClick={() => setSize(size + 1)}
          />
        </div>
      </div>
      <div style={{ ...flexRow, alignItems: "flex-start" }}>
        <div style={{ overflowX: "auto", maxHeight: 320, overflowY: "auto" }}>
          <div style={{ ...flexRow }}>
            <div style={labelStyle}>Weeks</div>
            <div style={{ flex: 1 }}>
              <WeekBoxes count />
            </div>
          </div>
          <div>{<RenderWeekBoxes />}</div>
        </div>
        <div>
          <Legend />
        </div>
      </div>
    </div>
  );
}

const flexRow = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
};
const flexCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};
const labelStyle = {
  ...flexCol,
  border: `1px solid black`,
  padding: 2,
  fontSize: 14,
  minWidth: 80,
  fontWeight: "bold",
  alignItems: "center",
  alignSelf: "stretch",
};
const legendColorStyle = {
  width: 14,
  height: 14,
  border: `1px solid black`,
};
