import React, { useState, useEffect } from "react";
import moment from "moment";
import _, { intersection } from "lodash";
// import {}

export default function CustomChart() {
  const [stageDuration] = useState({
    GM: 3,
    TPnGR: 7,
    GRnH: 9,
    TA: 2,
    TotalDuration: 21,
  });

  const [sectionIntervals] = useState({ inter: 10, intra: 19 });

  const flexRow = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  };
  const flexCol = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  };

  const [sectionDetails] = useState({
    GM: { startDate: moment() },
  });

  const [sectionAndCycle] = useState({ section: 1, cycle: 2 });

  const [mappedSectionData, setMappedSectionData] = useState([]);

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
        _.set(cycleObject, "section", String.fromCharCode(sectionId + 1 + 64));
        let sec1, sec2;
        if (cycleId < 1) {
          sec1 = calculateStageWeeks(
            moment(_.get(sectionDetails, "GM.startDate"))
          );
          sec2 = calculateStageWeeks(
            moment(_.get(sectionDetails, "GM.startDate")).add(
              _.get(sectionIntervals, "intra"),
              "w"
            )
          );
        } else {
          sec1 = calculateStageWeeks(
            moment(_.get(sectionDetails, "GM.startDate")).add(
              cycleId * _.get(sectionIntervals, "inter"),
              "w"
            )
          );
          sec2 = calculateStageWeeks(
            moment(_.get(sec1, "GM.startDate")).add(
              _.get(sectionIntervals, "intra"),
              "w"
            )
          );
        }
        _.set(cycleObject, "data", [sec1, sec2]);
        array.push(cycleObject);
        console.log(cycleObject);
      }
    }
    setMappedSectionData([...mappedSectionData, ...array]);
  };

  useEffect(() => {
    mapSectionDetails();
  }, []);

  const WeekBoxes = ({ boxSize, data, count }) => {
    const border = `1px solid #000`;
    const boxArray = _.times(52, Number);
    const boxStyle = {
      width: boxSize,
      height: boxSize,
      ...flexCol,
      borderLeft: border,
      borderRight: border,
      textAlign: "center",
      fontFamily: "sans-serif",
      boxShadow: "0 0 0 1px black",
      padding: 2,
      fontSize: 14,
    };
    let year = moment(_.get(data, "GM.startDate")).year();
    const getBGColor = (index, stages, year) => {
      let GM = `#FFCC00`;
      let TPnGR = `#c6e0b4`;
      let GRnH = `red`;
      let TA = `yellow`;
      let backgroundColor;
      _.mapKeys(stages, (dates, stage) => {
        const { startDate, endDate } = dates;
        switch (stage) {
          case "GM":
            if (
              index >= moment(startDate).weeks() &&
              index <= moment(endDate).weeks()
            )
              return (backgroundColor = GM);
            break;
          case "TPnGR":
            if (
              index >= moment(startDate).weeks() &&
              index <= moment(endDate).weeks()
            )
              return (backgroundColor = TPnGR);
            break;
          case "GRnH":
            if (
              index >= moment(startDate).weeks() &&
              index <= moment(endDate).weeks()
            )
              return (backgroundColor = GRnH);
            break;
          case "TA":
            if (
              index >= moment(startDate).weeks() &&
              index <= moment(endDate).weeks()
            )
              return (backgroundColor = TA);
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
          let backgroundColor;
          if (data) backgroundColor = getBGColor(index + 1, data, year);
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
    return mappedSectionData.map((sectionData) => {
      return _.get(sectionData, "data", []).map((data, index) => {
        return <WeekBoxes data={data} key={index} boxSize={16} />;
      });
    });
  };
  return (
    <div style={{ padding: 16 }}>
      <div style={{ flexRow }}>
        <div>{<RenderWeekBoxes />}</div>
      </div>
      <div style={{ padding: "6px 0" }}>
        <WeekBoxes boxSize={16} count />
      </div>
    </div>
  );
}
