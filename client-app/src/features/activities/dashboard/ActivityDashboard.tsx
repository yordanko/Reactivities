import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Grid, Loader } from 'semantic-ui-react';
import { PagingParams } from '../../../app/models/pagination';
import { useStore } from '../../../app/stores/store';
import ActivityFilters from './ActivityFilters';
import ActivityList from './ActivityList';
import ActivityListItemPlaceholder from './ActivityListItemPlaceHolder';
import { useSelector } from 'react-redux';
import { ReduxRootState, useAppDispatch } from '../../../app/store-redux/store';
import { DEFAULT_PAGE_SIZE, activitySlice, getDashboardActivity } from '../../../app/store-redux/activitySlice';
import { userSlice } from '../../../app/store-redux/userSlice';

export default observer(function ActivityDashboard() {
    
    const activityState = useSelector((state:ReduxRootState) =>state.activityReducer);
    const user = useSelector((state:ReduxRootState)=>state.userReducer.user);
    console.log(activityState);
    const { pagination, activityRegistry } = activityState;
    const dispatch = useAppDispatch();
    
    const [loadingNext, setLoadingNext] = useState(false);

    

    useEffect(() => {
      const fetchData = async () => {
        console.log("ActivityDashboard, function: useEffect");
        await dispatch(getDashboardActivity());
      };
      fetchData();
    }, []);
    
    function handleGetNext() {
      console.log("function: handleGetNext");
      setLoadingNext(true);
      dispatch(
        activitySlice.actions.setPageParams({
          pageNumber: pagination!.currentPage + 1,
          pageSize: DEFAULT_PAGE_SIZE,
        })
      );
      dispatch(getDashboardActivity()).then(() => setLoadingNext(false));
    }


    return (
      <Grid>
        <Grid.Column width="10">
          {activityState.loadingInitial && !loadingNext ? (
            <>
              <ActivityListItemPlaceholder />
              <ActivityListItemPlaceholder />
            </>
          ) : (
            <InfiniteScroll
              pageStart={0}
              loadMore={handleGetNext}
              hasMore={
                !loadingNext &&
                !!pagination &&
                pagination.currentPage < pagination.totalPages
              }
              initialLoad={false}
            >
              <ActivityList />
            </InfiniteScroll>
          )}
        </Grid.Column>
        <Grid.Column width="6">
          <ActivityFilters />
        </Grid.Column>
        <Grid.Column width="10">
          <Loader active={loadingNext} />
        </Grid.Column>
      </Grid>
    );
})
