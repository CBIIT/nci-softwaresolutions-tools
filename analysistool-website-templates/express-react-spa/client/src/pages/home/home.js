import React from 'react';
import { NavLink } from 'react-router-dom'

export function Home() {

    /** Properties to customize the main section, which contins the tool's name, description, and a call to action (button) */
    const mainSection = {
        title: 'Tool Name Placeholder',
        description: 'Tool description placeholder',
        actionLink: {
            route: '/calculate',
            children: 'Action Placeholder'
        }
    };

    /** Properties for cards which will be displayed under the main section on the home page */
    const cards = [
        {
            title: 'Sample',
            body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer a urna non ligula molestie lacinia. Quisque fermentum quam porttitor, scelerisque orci sit amet, ornare lacus.',
            link: {route: '/action', children: 'Action'},
        },
        {
            title: 'Calculate',
            body: 'Ut hendrerit augue id enim malesuada tincidunt. Quisque fermentum convallis mi, vel placerat sem tempor at. Maecenas pulvinar in ligula ultrices elementum. Sed sed enim vestibulum, convallis eros ut, mattis enim.',
            link: {route: '/calculate', children: 'Calculate'},
        },
        {
            title: 'About',
            body: 'Integer luctus ex mauris, eget feugiat est accumsan sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer et ex sed massa accumsan ultricies in nec sem. Donec lacinia purus diam, nec semper magna bibendum a.',
            link: {route: '/about', children: 'Read More'},
        },
    ];

    return <>
        <section className="jumbotron jumbotron-fluid text-light bg-primary-darker">
            <div className="container">
                <h1 className="display-4 mb-4">
                    <span className="d-inline-block py-4" style={{ borderBottom: '2px solid white' }}>
                        {mainSection.title}
                    </span>
                </h1>
                <p className="lead">
                    {mainSection.description}
                </p>
                <NavLink to={mainSection.actionLink.route} className="btn btn-lg btn-outline-light">
                    {mainSection.actionLink.children}
                </NavLink>
            </div>
        </section>

        <section className="container mb-5">
            <div className="row">
                {cards.map((card, i) => 
                    <div key={`home-card-${i}`} className="col-md-4 mb-4">
                        <div className="card shadow h-100">
                            <h2 className="h5 card-header bg-primary text-white">
                                {card.title}
                            </h2>

                            <div className="card-body">
                                <p className="card-text">
                                    {card.body}
                                </p>
                            </div>

                            <div className="card-footer bg-white border-0">
                                <NavLink to={card.link.route} className="btn btn-primary btn-block">
                                    {card.link.children}
                                </NavLink>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    </>
}