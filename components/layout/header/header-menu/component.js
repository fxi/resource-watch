import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

// Next
import { Link } from 'routes';

// Components
import HeaderData from 'components/layout/header/header-data';
import HeaderAbout from 'components/layout/header/header-about';
import HeaderSearch from 'components/layout/header/header-search';
import HeaderUser from 'components/layout/header/header-user';
import HeaderTopics from 'components/layout/header/header-topics';

export default class HeaderMenu extends React.PureComponent {
  static propTypes = {
    header: PropTypes.object,
    routes: PropTypes.object
  }

  static defaultProps = {
    header: {},
    routes: {}
  }

  headerComponents = {
    data: <HeaderData />,
    about: <HeaderAbout />,
    topics: <HeaderTopics />,
    myrw: <HeaderUser />,
    search: <HeaderSearch />
  }

  render() {
    const { header, routes } = this.props;

    return (
      <nav className="header-menu">
        <ul>
          {header.items.map((item) => {
            const activeClassName = classnames({
              '-active': item.pathnames && item.pathnames.includes(routes.pathname)
            });

            const component = this.headerComponents[item.id];

            return (
              <li key={item.label} className={activeClassName}>
                {!component && item.route &&
                  <Link
                    route={item.route}
                    params={item.params}
                  >
                    <a>{item.label}</a>
                  </Link>
                }

                {!component && item.href &&
                  <a
                    href={item.href}
                  >
                    {item.label}
                  </a>
                }

                {!!component &&
                  React.cloneElement(
                    component,
                    item
                  )
                }
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}
