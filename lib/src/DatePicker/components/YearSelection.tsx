import createStyles from '@material-ui/core/styles/createStyles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { findDOMNode } from 'react-dom';
import EventListener from 'react-event-listener';
import { withUtils, WithUtilsProps } from '../../_shared/WithUtils';
import { DateType, DomainPropTypes } from '../../constants/prop-types';
import { MaterialUiPickersDate } from '../../typings/date';
import Year from './Year';

export interface YearSelectionProps extends WithUtilsProps, WithStyles<typeof styles> {
  date: MaterialUiPickersDate;
  minDate?: DateType;
  maxDate?: DateType;
  onChange: (date: MaterialUiPickersDate) => void;
  disablePast?: boolean | null | undefined;
  disableFuture?: boolean | null | undefined;
  animateYearScrolling?: boolean | null | undefined;
  onYearChange?: (date: MaterialUiPickersDate) => void;
  allowKeyboardControl?: boolean;
}

export class YearSelection extends React.PureComponent<YearSelectionProps> {
  public static propTypes: any = {
    date: PropTypes.shape({}).isRequired,
    minDate: DomainPropTypes.date,
    maxDate: DomainPropTypes.date,
    onChange: PropTypes.func.isRequired,
    animateYearScrolling: PropTypes.bool,
    innerRef: PropTypes.any,
    allowKeyboardControl: PropTypes.bool,
  };

  public static defaultProps = {
    animateYearScrolling: false,
    minDate: new Date('1900-01-01'),
    maxDate: new Date('2100-01-01'),
    allowKeyboardControl: true,
  };

  public selectedYearRef?: React.ReactInstance = undefined;

  public getSelectedYearRef = (ref?: React.ReactInstance) => {
    this.selectedYearRef = ref;
  };

  public scrollToCurrentYear = (domNode: React.ReactInstance) => {
    const { animateYearScrolling } = this.props;
    const currentYearElement = findDOMNode(domNode) as Element;

    if (currentYearElement && currentYearElement.scrollIntoView) {
      if (animateYearScrolling) {
        setTimeout(() => currentYearElement.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        currentYearElement.scrollIntoView();
      }
    }
  };

  public componentDidMount() {
    if (this.selectedYearRef) {
      this.scrollToCurrentYear(this.selectedYearRef);
    }
  }

  public onYearSelect = (year: number) => {
    const { date, onChange, utils, onYearChange } = this.props;

    const newDate = utils.setYear(date, year);
    if (onYearChange) {
      onYearChange(newDate);
    }

    onChange(newDate);
  };

  public shouldDisableYear = (year: MaterialUiPickersDate) => {
    const { disablePast, disableFuture, utils } = this.props;
    return (
      (disablePast && utils.isBeforeYear(year, utils.date())) ||
      (disableFuture && utils.isAfterYear(year, utils.date()))
    );
  };

  public setYear = (year: MaterialUiPickersDate) => {
    const { utils } = this.props;
    if (year && !this.shouldDisableYear(year)) {
      this.onYearSelect(utils.getYear(year));
    }
  };

  public handleKeyDown = (event: KeyboardEvent) => {
    const { date, utils } = this.props;
    switch (event.key) {
      case 'ArrowUp':
        this.setYear(utils.addDays(date, -365));
        break;
      case 'ArrowDown':
        this.setYear(utils.addDays(date, 365));
        break;
      default:
        return;
    }

    event.preventDefault();
  };

  public render() {
    const { allowKeyboardControl, minDate, maxDate, date, classes, utils } = this.props;
    const currentYear = utils.getYear(date);

    return (
      <div className={classes.container}>
        {allowKeyboardControl && <EventListener target="window" onKeyDown={this.handleKeyDown} />}

        {utils.getYearRange(minDate, maxDate).map(year => {
          const yearNumber = utils.getYear(year);
          const selected = yearNumber === currentYear;

          return (
            <Year
              key={utils.getYearText(year)}
              selected={selected}
              value={yearNumber}
              onSelect={this.onYearSelect}
              ref={selected ? this.getSelectedYearRef : undefined}
              disabled={this.shouldDisableYear(year)}
            >
              {utils.getYearText(year)}
            </Year>
          );
        })}
      </div>
    );
  }
}

export const styles = createStyles({
  container: {
    maxHeight: 300,
    overflowY: 'auto',
    justifyContent: 'center',
  },
});

export default withStyles(styles, { name: 'MuiPickersYearSelection' })(withUtils()(YearSelection));
