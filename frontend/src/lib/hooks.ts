"use client";

import { useEffect, useState } from "react";
import type { Product, Category } from "./types";
import { productsApi, categoriesApi, type ProductListParams } from "./api";

interface FetchState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useProducts(params: ProductListParams = {}) {
  const key = JSON.stringify(params);
  const [state, setState] = useState<FetchState<Product[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets loading state to sync with a new fetch triggered by changed params
    setState((s) => ({ ...s, loading: true, error: null }));
    productsApi
      .list(JSON.parse(key))
      .then((res) => {
        if (!cancelled) setState({ data: res.products, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: [], loading: false, error: err.message ?? "Failed to load products" });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}

export function useProduct(slug: string | undefined) {
  const [state, setState] = useState<FetchState<Product | null>>({ data: null, loading: true, error: null });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets loading state to sync with a new fetch triggered by a changed slug
    setState({ data: null, loading: true, error: null });
    productsApi
      .get(slug)
      .then((res) => {
        if (!cancelled) setState({ data: res.product, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: null, loading: false, error: err.message ?? "Product not found" });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}

export function useCategories() {
  const [state, setState] = useState<FetchState<Category[]>>({ data: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    categoriesApi
      .list()
      .then((res) => {
        if (!cancelled) setState({ data: res.categories, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ data: [], loading: false, error: err.message ?? "Failed to load categories" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
