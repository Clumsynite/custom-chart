import React, { useState, useEffect } from "react";
import moment from "moment";
import _ from "lodash";
import { Select, Button, Tooltip } from "antd";
import "antd/dist/antd.css";
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

  const [currentYear, setCurrentYear] = useState(moment().year());

  const [size, setSize] = useState(18);

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
        let sec1, sec2;
        if (cycleId < 1) {
          let init = calculateStageWeeks(
            moment(_.get(sectionDetails, "GM.startDate"))
          );
          sec1 = [
            init,
            // calculateStageWeeks(
            //   moment(_.get(init, "TA.endDate")).add(
            //     _.get(stageDuration, "total") -
            //       _.get(stageDuration, "GM") * 2 +
            //       1,
            //     "w"
            //   )
            // ),
          ];
          sec2 = [
            calculateStageWeeks(
              moment(_.get(sectionDetails, "GM.startDate")).add(
                _.get(sectionIntervals, "intra"),
                "w"
              )
            ),
          ];
        } else {
          sec1 = [
            calculateStageWeeks(
              moment(_.get(sectionDetails, "GM.startDate")).add(
                cycleId * _.get(sectionIntervals, "inter"),
                "w"
              )
            ),
          ];
          sec2 = [
            calculateStageWeeks(
              moment(_.get(sec1[0], "GM.startDate")).add(
                _.get(sectionIntervals, "intra"),
                "w"
              )
            ),
          ];
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
    const getBGColor = (index, stages) => {
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
            backgroundColor = `#fff`;
            break;
        }
      });
      return backgroundColor;
    };
    return (
      <div style={{ ...flexRow }}>
        {_.map(boxArray, (week, index) => {
          let backgroundColor = "#d9e1f2";
          if (data) {
            for (let stage of data) {
              backgroundColor = getBGColor(index + 1, stage);
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
      <div style={{ ...flexRow, alignItems: "flex-start" }}>
        <div style={{ overflowX: "auto", maxHeight: 400, overflowY: "auto" }}>
          <div style={{ padding: "10px 0" }}>
            <Select
              defaultValue={moment().year()}
              style={{ width: 120 }}
              onChange={setCurrentYear}
            >
              <Option value={moment().year()}>Year 1</Option>
              <Option value={moment().add(1, "y").year()}>Year 2</Option>
              <Option value={moment().add(2, "y").year()}>Year 3</Option>
              <Option value={moment().add(3, "y").year()}>Year 4</Option>
              <Option value={moment().add(4, "y").year()}>Year 5</Option>
            </Select>
          </div>

          <div style={{ ...flexRow }}>
            <div style={labelStyle}>Weeks</div>
            <div style={{ flex: 1 }}>
              <WeekBoxes count />
            </div>
          </div>

          <div>{<RenderWeekBoxes />}</div>
        </div>
        <div>
          <div
            style={{
              ...flexRow,
              justifyContent: "space-between",
              padding: "10px 0",
            }}
          >
            <Tooltip title="Zoom Out">
              <Button
                size="small"
                icon={<ZoomOutOutlined />}
                onClick={() => setSize(size - 1)}
              />
            </Tooltip>
            <div>Size</div>
            <Tooltip title="Zoom In">
              <Button
                size="small"
                icon={<ZoomInOutlined />}
                onClick={() => setSize(size + 1)}
              />
            </Tooltip>
          </div>
          <div style={{ padding: "20px 0" }}>
            <Legend />
          </div>
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
