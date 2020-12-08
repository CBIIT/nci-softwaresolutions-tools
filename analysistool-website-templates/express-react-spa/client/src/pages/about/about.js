import React from 'react';
import { Card } from 'react-bootstrap';

export function About() {
    return <>
        <div className="container my-4">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white">
                    <h1 className="h5 my-0">About</h1>
                </Card.Header>
                <Card.Body>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam scelerisque ligula vel velit pulvinar, ac tempor urna finibus. Nullam ornare nibh vitae tellus cursus, nec consequat dui aliquam. Donec eget nisl eu ligula vulputate congue id fermentum tortor. In a augue a sem accumsan sagittis. Aenean commodo, purus at pretium ultricies, enim mauris mattis orci, nec porttitor tellus turpis eu sapien. Donec luctus, purus nec dapibus pharetra, libero lacus commodo ex, vitae pharetra enim orci eget nunc. Integer vitae turpis commodo, ullamcorper neque id, pretium sem. Aliquam tempor consequat nibh id tincidunt. Sed sed mauris eu lectus dignissim luctus. Donec ac sagittis sapien. Sed lobortis ipsum in sapien lacinia, eget imperdiet nisl molestie. Ut consequat, sem id gravida maximus, nibh elit ornare risus, non ullamcorper felis est eget lacus.
                    </p>

                    <p>
                        Vestibulum non odio auctor, varius eros quis, mollis tortor. Aenean tincidunt metus ac ante condimentum maximus. Duis commodo odio nec eros condimentum, ut vulputate ligula placerat. Quisque mauris massa, imperdiet at auctor in, ultrices id mi. Phasellus eget ullamcorper purus. Curabitur ut dolor diam. Pellentesque laoreet massa et efficitur eleifend. Cras accumsan lectus at nulla facilisis aliquet. Donec bibendum felis at quam molestie, at mollis felis posuere. Praesent imperdiet nisl non dignissim congue. Praesent faucibus dapibus sagittis. Aliquam non est ultrices, porttitor diam non, lobortis velit. Praesent vulputate massa at tincidunt facilisis.
                    </p>
                </Card.Body>
            </Card>
        </div>
    </>
}