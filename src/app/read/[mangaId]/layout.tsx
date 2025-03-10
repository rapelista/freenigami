import { ButtonBack } from "~/components/back";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <div className="border-b">
        <div className="container px-4 lg:px-0 mx-auto flex items-center">
          <ButtonBack />
        </div>
      </div>
      {children}
    </>
  );
}
