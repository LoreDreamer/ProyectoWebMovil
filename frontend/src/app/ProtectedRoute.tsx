import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type ProtectedRouteProps = RouteProps & {
  component: React.ComponentType<any>;
  adminOnly?: boolean;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  adminOnly = false,
  ...routeProps
}) => {
  const { user } = useAuth();

  return (
    <Route
      {...routeProps}
      render={(props) => {
        if (!user) return <Redirect to="/login" />;
        if (adminOnly && user.role !== 'admin') return <Redirect to="/inicio" />;

        return <Component {...props} />;
      }}
    />
  );
};
