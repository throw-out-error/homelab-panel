import React from "react";
import {
    Button,
    Form,
    FormControl,
    Nav,
    Navbar,
    NavDropdown,
} from "react-bootstrap";

export const Header = () => (
    <header>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
                <Nav.Link href="/">Home</Nav.Link>
                <NavDropdown title="Dashboard" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">
                        Clusters
                    </NavDropdown.Item>
                </NavDropdown>
            </Nav>
            <Form inline>
                <FormControl
                    type="text"
                    placeholder="Search"
                    className="mr-sm-2"
                />
                <Button variant="outline-success">Search</Button>
            </Form>
        </Navbar.Collapse>
    </header>
);
