import java.io.*;
import java.lang.reflect.*;
import java.util.*;
public class JavaParity {
 public static void main(String[] args) throws Exception {
  BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
  String line;
  Field counter = NFA.class.getDeclaredField("ID_Counter"); counter.setAccessible(true);
  while ((line = reader.readLine()) != null) {
   String[] parts=line.split("\\t",-1);
   // Isolate each independent comparison from the original global ID counter.
   counter.set(null,Integer.valueOf(Integer.parseInt(parts[0])));
   NFA machine=Main.buildNFA(parts[1]);
   System.out.println(machine.acceptsString(parts[2]));
  }
 }
}
