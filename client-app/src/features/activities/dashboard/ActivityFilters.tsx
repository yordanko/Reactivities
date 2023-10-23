import { observer } from 'mobx-react-lite';
import React from 'react';
import Calendar from 'react-calendar';
import { Header, Menu } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
import { ReduxRootState, useAppDispatch } from '../../../app/store-redux/store';
import { useSelector } from 'react-redux';
import { ActivityReduxSoreType, activitySlice } from '../../../app/store-redux/activitySlice';

export default observer(function ActivityFilters() {
    const activityState: ActivityReduxSoreType = useSelector(
      (state: ReduxRootState) => state.activityReducer
    );
    const { predicate } = activityState;
    const dispatch = useAppDispatch();
    return (
      <>
        <Menu vertical size="large" style={{ width: "100%", marginTop: 25 }}>
          <Header icon="filter" attached color="teal" content="Filters" />
          <Menu.Item
            content="All Activites"
            active={!!predicate.find(i => i.key === "all")}
            onClick={() =>
              dispatch(
                activitySlice.actions.setPredicate({
                  predicated: "all",
                  value: true,
                })
              )
            }
          />
          <Menu.Item
            content="I'm going"
            active={!!predicate.find(i=>i.key == "isGoing")}
            onClick={() =>
              dispatch(
                activitySlice.actions.setPredicate({
                  predicated: "isGoing",
                  value: true,
                })
              )
            }
          />
          <Menu.Item
            content="I'm hosting"
            active={!!predicate.find(i=>i.key ==="isHost")}
            onClick={() =>
              dispatch(
                activitySlice.actions.setPredicate({
                  predicated: "isHost",
                  value: true,
                })
              )
            }
          />
        </Menu>
        <Header />
        <Calendar
          onChange={(date: any) =>
            dispatch(
              activitySlice.actions.setPredicate({
                predicated: "startDate",
                value: date as Date,
              })
            )
          }
        />
      </>
    );
})
