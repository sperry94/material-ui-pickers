import * as React from 'react';
import EventListener from 'react-event-listener';

import { createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import { withUtils, WithUtilsProps } from '../../_shared/WithUtils';
import { DateType } from '../../constants/prop-types';
import { MaterialUiPickersDate } from '../../typings/date';
import Month from './Month';

export interface MonthSelectionProps extends WithUtilsProps, WithStyles<typeof styles> {
  date: MaterialUiPickersDate;
  minDate?: DateType;
  maxDate?: DateType;
  onChange: (date: MaterialUiPickersDate) => void;
  disablePast?: boolean | null | undefined;
  disableFuture?: boolean | null | undefined;
  allowKeyboardControl?: boolean;
}

export class MonthSelection extends React.PureComponent<MonthSelectionProps> {
  public static defaultProps = {
    minDate: new Date('1900-01-01'),
    maxDate: new Date('2100-01-01'),
    allowKeyboardControl: true,
  };

  public onMonthSelect = (month: number) => {
    const { date, onChange, utils } = this.props;

    const newDate = utils.setMonth(date, month);
    onChange(newDate);
  };

  public shouldDisableMonth = (month: Date) => {
    const { utils, disablePast, disableFuture, minDate, maxDate } = this.props;
    const now = utils.date();
    const utilMinDate = utils.date(minDate);
    const utilMaxDate = utils.date(maxDate);

    const firstEnabledMonth = utils.startOfMonth(
      disablePast && utils.isAfter(now, utilMinDate) ? now : utilMinDate
    );

    const lastEnabledMonth = utils.startOfMonth(
      disableFuture && utils.isBefore(now, utilMaxDate) ? now : utilMaxDate
    );

    const isBeforeFirstEnabled = utils.isBefore(month, firstEnabledMonth);
    const isAfterLastEnabled = utils.isAfter(month, lastEnabledMonth);
    return isBeforeFirstEnabled || isAfterLastEnabled;
  };

  public setMonth = (date: MaterialUiPickersDate) => {
    const { utils } = this.props;
    if (date && !this.shouldDisableMonth(date)) {
      this.onMonthSelect(utils.getMonth(date));
    }
  };

  public handleKeyDown = (event: KeyboardEvent) => {
    const { date, utils } = this.props;
    switch (event.key) {
      case 'ArrowLeft':
        this.setMonth(utils.addDays(date, -31));
        break;
      case 'ArrowRight':
        this.setMonth(utils.addDays(date, 31));
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  public render() {
    const { allowKeyboardControl, date, classes, utils } = this.props;
    const currentMonth = utils.getMonth(date);

    return (
      <div className={classes.container}>
        {allowKeyboardControl && <EventListener target="window" onKeyDown={this.handleKeyDown} />}

        {utils.getMonthArray(date).map(month => {
          const monthNumber = utils.getMonth(month);
          const monthText = utils.format(month, 'MMM');

          return (
            <Month
              key={monthText}
              value={monthNumber}
              selected={monthNumber === currentMonth}
              onSelect={this.onMonthSelect}
              disabled={this.shouldDisableMonth(month)}
            >
              {monthText}
            </Month>
          );
        })}
      </div>
    );
  }
}

export const styles = createStyles({
  container: {
    width: 310,
    display: 'flex',
    flexWrap: 'wrap',
    alignContent: 'stretch',
  },
});

export default withStyles(styles, { name: 'MuiPickersMonthSelection' })(
  withUtils()(MonthSelection)
);
