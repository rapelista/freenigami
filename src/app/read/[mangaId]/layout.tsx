import { ButtonBack } from "~/components/back";

export default function Layout({ children }: React.PropsWithChildren) {
  return (
    <>
      <div className="border-b">
        <div className="container mx-auto flex items-center">
          <ButtonBack />
        </div>
      </div>
      {children}
    </>
  );
}
