import { observer } from 'mobx-react-lite';
import { Fragment } from 'react';
import { Header } from "semantic-ui-react";
import { useStore } from '../../../app/stores/store';
import ActivityListItem from './ActivityListItem';
import { useSelector } from 'react-redux';
import { ReduxRootState } from '../../../app/store-redux/store';
import { ActivityReduxSoreType } from '../../../app/store-redux/activitySlice';
import { Activity } from '../../../app/models/activity';

export default observer(function ActivityList() {

    //Converted to Thunk/Redux!
    const activityState: ActivityReduxSoreType  = useSelector(
      (state: ReduxRootState) => state.activityReducer
    );
    const {activityRegistry} = activityState;

    const groupedActivities = () => {
        return Object.entries(
            activitiesByDate().reduce((activities, activity) => {
                const date = activity.date!.toISOString().split('T')[0];
                activities[date] = activities[date] ? [...activities[date], activity] : [activity];
                return activities;
            }, {} as { [key: string]: Activity[] })
        )
    }
    
    const activitiesByDate = () => {
        return Array.from(activityRegistry.values()).sort((a, b) =>
            a.date!.getTime() - b.date!.getTime());
    }

    return (
        <>
            {groupedActivities().map(([group, activities]) => (
                <Fragment key={group}>
                    <Header sub color='teal'>
                        {group}
                    </Header>
                    {activities && activities.map(activity => (
                        <ActivityListItem key={activity.id} activity={activity} />
                    ))}
                </Fragment>
            ))}
        </>

    )
})
