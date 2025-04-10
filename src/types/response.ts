export type ResponseType<T> = { data: T };

export type ListResponseType<T> = ResponseType<T[]> & {
  meta: {
    page: number;
    total_page: number;
  };
};
