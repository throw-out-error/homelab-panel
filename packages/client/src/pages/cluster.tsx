import React, { Component } from "react";
import { Button, Card, Container } from "react-bootstrap";
import { apiUrl } from "../util/config";
import axios from "axios";

export class ClusterPage extends Component {
    async fetchClusters() {
        return axios.get(`${apiUrl}/cluster/status`).then((res) => res.data);
    }

    componentDidMount() {
        this.fetchClusters().then((clusters) => { this.setState({
            clusters: clusters as HostContainer[]
        }));
    }

    render() {
        return (
            <Container id="main">
                <Card className="text-center">
                    <Card.Header>Featured</Card.Header>
                    <Card.Body>
                        <Card.Title>Special title treatment</Card.Title>
                        <Card.Text></Card.Text>
                        <Button variant="primary">Go somewhere</Button>
                    </Card.Body>
                    <Card.Footer className="text-muted">2 days ago</Card.Footer>
                </Card>
            </Container>
        );
    }
}
