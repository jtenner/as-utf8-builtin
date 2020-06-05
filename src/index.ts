import { Transform } from "assemblyscript/cli/transform";
import * as Long from "long";

import {
  Parser,
  NodeKind,
  ASTBuilder,
  Node,
  CallExpression,
  IdentifierExpression,
  LiteralExpression,
  StringLiteralExpression,
  LiteralKind,
  TypeNode,
  AssertionKind,
  Source,
  NamedTypeNode,
  FunctionTypeNode,
  ParameterNode,
  TypeParameterNode,
  AssertionExpression,
  BinaryExpression,
  VariableStatement,
  DecoratorNode,
  ClassExpression,
  ClassDeclaration,
  CommaExpression,
  ElementAccessExpression,
  FunctionExpression,
  FunctionDeclaration,
  InstanceOfExpression,
  ObjectLiteralExpression,
  ArrayLiteralExpression,
  NewExpression,
  TypeName,
  ParenthesizedExpression,
  PropertyAccessExpression,
  TernaryExpression,
  UnaryPostfixExpression,
  UnaryPrefixExpression,
  BlockStatement,
  BreakStatement,
  ContinueStatement,
  DoStatement,
  ExportStatement,
  ExportMember,
  ExportDefaultStatement,
  DeclarationStatement,
  ExportImportStatement,
  ExpressionStatement,
  ForStatement,
  ForOfStatement,
  IfStatement,
  ImportStatement,
  ImportDeclaration,
  ReturnStatement,
  SwitchStatement,
  SwitchCase,
  WhileStatement,
  EnumDeclaration,
  EnumValueDeclaration,
  FieldDeclaration,
  InterfaceDeclaration,
  MethodDeclaration,
  NamespaceDeclaration,
  TypeDeclaration,
  VariableDeclaration,
  IndexSignatureDeclaration,
  ThrowStatement,
  TryStatement,
} from "assemblyscript";

class Visitor extends ASTBuilder {
  constructor() {
    super();
  }

  path: Node[] = [];

  get parentNode(): Node | null {
    return this.path.length <= 1 ? null : this.path[this.path.length - 2];
  }

  get currentNode(): Node | null {
    return this.path.length < 1 ? null : this.path[this.path.length - 1];
  }

  visitNode(node: Node): void {
    this.path.push(node);
    super.visitNode(node);
    this.path.pop();
  }

  replaceNode(node: Node): void {
    const parentNode = this.parentNode;
    if (!parentNode) return;
    const currentNode = this.currentNode;
    switch (parentNode.kind) {
      case NodeKind.SOURCE: {
        const source = <Source>parentNode;
        if (source.statements) {
          for (let i = 0; i < source.statements.length; i++) {
            if (currentNode === source.statements[i]) {
              source.statements[i] = node;
              return;
            }
          }
        }
        return;
      }
      // types
      case NodeKind.NAMEDTYPE: {
        const namedType = <NamedTypeNode>parentNode;
        if (namedType.typeArguments) {
          for (let i = 0; i < namedType.typeArguments.length; i++) {
            if (namedType.typeArguments[i] === currentNode) {
              namedType.typeArguments[i] = node as TypeNode;
              return;
            }
          }
        }
        return;
      }

      case NodeKind.FUNCTIONTYPE: {
        const functionType = <FunctionTypeNode>parentNode;
        if (functionType.explicitThisType === currentNode) {
          functionType.explicitThisType = node as NamedTypeNode;
          return;
        }

        if (functionType.parameters) {
          for (let i = 0; i < functionType.parameters.length; i++) {
            if (functionType.parameters[i] === currentNode) {
              functionType.parameters[i] = node as ParameterNode;
              return;
            }
          }
        }

        if (functionType.returnType === currentNode) {
          functionType.returnType = node as TypeNode;
          return;
        }
        return;
      }
      case NodeKind.TYPEPARAMETER: {
        const typeParameter = <TypeParameterNode>parentNode;
        if (typeParameter.name === currentNode) {
          typeParameter.name = node as IdentifierExpression;
          return;
        }
        if (typeParameter.defaultType === currentNode) {
          typeParameter.defaultType = node as NamedTypeNode;
          return;
        }
        if (typeParameter.extendsType === currentNode) {
          typeParameter.extendsType = currentNode as NamedTypeNode;
          return;
        }
        return;
      }

      case NodeKind.ASSERTION: {
        const assertion = <AssertionExpression>parentNode;
        if (assertion.expression === currentNode) {
          assertion.expression = node;
          return;
        }
        if (assertion.toType === currentNode) {
          assertion.toType = node as TypeNode;
          return;
        }
        return;
      }
      case NodeKind.BINARY: {
        const expression = <BinaryExpression>parentNode;
        if (expression.left === currentNode) {
          expression.left = node;
          return;
        }

        if (expression.right === currentNode) {
          expression.right = node;
          return;
        }
        return;
      }
      case NodeKind.CALL: {
        const parent = <CallExpression>parentNode;
        if (parent.expression === currentNode) {
          parent.expression = node;
          return;
        }
        if (parent.typeArguments) {
          for (let i = 0; i < parent.typeArguments.length; i++) {
            if (parent.typeArguments[i] === currentNode) {
              parent.typeArguments[i] = node as TypeNode;
              return;
            }
          }
        }
        if (parent.arguments) {
          for (let i = 0; i < parent.arguments.length; i++) {
            if (parent.arguments[i] === currentNode) {
              parent.arguments[i] = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.CLASS: {
        let classExpression = <ClassExpression>parentNode;
        if (classExpression.declaration === currentNode) {
          classExpression.declaration = node as ClassDeclaration;
        }
        return;
      }
      case NodeKind.COMMA: {
        let commaExpression = <CommaExpression>parentNode;
        if (commaExpression.expressions) {
          for (let i = 0; i < commaExpression.expressions.length; i++) {
            if (commaExpression.expressions[i] === currentNode) {
              commaExpression.expressions[i] = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.ELEMENTACCESS: {
        const parent = <ElementAccessExpression>parentNode;
        if (parent.expression === currentNode) {
          parent.expression = node;
          return;
        }

        if (parent.elementExpression === currentNode) {
          parent.elementExpression = node;
        }
        return;
      }
      case NodeKind.FUNCTION: {
        const parent = <FunctionExpression>parentNode;
        if (parent.declaration === currentNode) {
          parent.declaration = node as FunctionDeclaration;
        }
        return;
      }
      case NodeKind.INSTANCEOF: {
        const parent = <InstanceOfExpression>parentNode;
        if (parent.expression === currentNode) {
          parent.expression = node;
          return;
        }

        if (parent.isType === currentNode) {
          parent.isType = node as TypeNode;
        }
        return;
      }
      case NodeKind.LITERAL: {
        const parent = <LiteralExpression>parentNode;
        switch (parent.literalKind) {
          case LiteralKind.OBJECT: {
            let obj = <ObjectLiteralExpression>parentNode;
            if (obj.names) {
              for (let i = 0; i < obj.names.length; i++) {
                if (obj.names[i] === currentNode) {
                  obj.names[i] = node as IdentifierExpression;
                  return;
                }
              }
            }
            if (obj.values) {
              for (let i = 0; i < obj.values.length; i++) {
                if (obj.values[i] === currentNode) {
                  obj.values[i] = node;
                  return;
                }
              }
            }
            return;
          }
          case LiteralKind.ARRAY: {
            let obj = <ArrayLiteralExpression>parentNode;
            if (obj.elementExpressions) {
              for (let i = 0; i < obj.elementExpressions.length; i++) {
                if (obj.elementExpressions[i] === currentNode) {
                  obj.elementExpressions[i] = node;
                  return;
                }
              }
            }
            return;
          }
        }
        return;
      }
      case NodeKind.NEW: {
        const parent = <NewExpression>parentNode;
        if (parent.typeName === currentNode) {
          parent.typeName = node as TypeName;
          return;
        }
        if (parent.typeArguments) {
          for (let i = 0; i < parent.typeArguments.length; i++) {
            if (parent.typeArguments[i] === currentNode) {
              parent.typeArguments[i] = node as TypeNode;
              return;
            }
          }
        }
        if (parent.arguments) {
          for (let i = 0; i < parent.arguments.length; i++) {
            if (parent.arguments[i] === currentNode) {
              parent.arguments[i] = node as TypeNode;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.PARENTHESIZED: {
        const parent = <ParenthesizedExpression>parentNode;
        if (parent.expression === currentNode) {
          parent.expression = node;
        }
        return;
      }
      case NodeKind.PROPERTYACCESS: {
        const parent = <PropertyAccessExpression>parentNode;
        if (parent.expression === currentNode) {
          parent.expression = node;
          return;
        }

        if (parent.property === currentNode) {
          parent.expression = node;
          return;
        }
        return;
      }
      case NodeKind.TERNARY: {
        const parent = <TernaryExpression>node;
        if (parent.condition === currentNode) {
          parent.condition = node;
          return;
        }
        if (parent.ifThen === currentNode) {
          parent.ifThen = node;
          return;
        }
        if (parent.ifElse === currentNode) {
          parent.ifElse = node;
        }
        return;
      }
      case NodeKind.UNARYPOSTFIX: {
        const parent = <UnaryPostfixExpression>parentNode;
        if (parent.operand === currentNode) {
          parent.operand = node;
        }
        return;
      }
      case NodeKind.UNARYPREFIX: {
        const parent = <UnaryPrefixExpression>parentNode;
        if (parent.operand === currentNode) {
          parent.operand = node;
        }
        return;
      }
      //
      // // statements
      //
      case NodeKind.BLOCK: {
        const parent = <BlockStatement>parentNode;
        for (let i = 0; i < parent.statements.length; i++) {
          if (parent.statements[i] === currentNode) {
            parent.statements[i] = node;
          }
        }
        return;
      }
      case NodeKind.BREAK: {
        const parent = <BreakStatement>parentNode;
        if (parent.label === currentNode) {
          parent.label = node as IdentifierExpression;
        }
        return;
      }
      case NodeKind.CONTINUE: {
        const parent = <ContinueStatement>parentNode;
        if (parent.label === currentNode) {
          parent.label = node as IdentifierExpression;
        }
        return;
      }
      case NodeKind.DO: {
        const parent = <DoStatement>parentNode;
        if (parent.condition === currentNode) {
          parent.condition = node;
          return;
        }

        if (parent.statement === currentNode) {
          parent.statement = node;
          return;
        }
        return;
      }
      case NodeKind.EXPORT: {
        const parent = <ExportStatement>parentNode;
        if (parent.path === currentNode) {
          parent.path = node as StringLiteralExpression;
          return;
        }
        if (parent.members) {
          for (let i = 0; i < parent.members.length; i++) {
            if (parent.members[i] === currentNode) {
              parent.members[i] = node as ExportMember;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.EXPORTDEFAULT: {
        const parent = <ExportDefaultStatement>parentNode;
        if (parent.declaration === currentNode) {
          parent.declaration = node as DeclarationStatement;
        }
        return;
      }
      case NodeKind.EXPORTIMPORT: {
        const parent = <ExportImportStatement>parentNode;
        if (parent.externalName === currentNode) {
          parent.externalName = node as IdentifierExpression;
          return;
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
        }
        return;
      }
      case NodeKind.EXPRESSION: {
        const parent = <ExpressionStatement>parentNode;
        if (parent.expression === currentNode) {
          parent.expression = node;
        }
        return;
      }
      case NodeKind.FOR: {
        const parent = <ForStatement>parentNode;
        if (parent.initializer === currentNode) {
          parent.initializer = node;
          return;
        }

        if (parent.condition === currentNode) {
          parent.condition = node;
          return;
        }

        if (parent.incrementor === currentNode) {
          parent.incrementor = node;
          return;
        }

        if (parent.statement === currentNode) {
          parent.statement = node;
        }
        return;
      }
      case NodeKind.FOROF: {
        const parent = <ForOfStatement>parentNode;
        if (parent.variable === currentNode) {
          parent.variable = node;
          return;
        }

        if (parent.iterable === currentNode) {
          parent.variable = node;
          return;
        }

        if (parent.statement === currentNode) {
          parent.statement = node;
        }
        return;
      }
      case NodeKind.IF: {
        const parent = <IfStatement>parentNode;
        if (parent.condition === currentNode) {
          parent.condition = node;
          return;
        }

        if (parent.ifTrue === currentNode) {
          parent.ifTrue = node;
          return;
        }

        if (parent.ifFalse === currentNode) {
          parent.ifFalse = node;
        }
        return;
      }
      case NodeKind.IMPORT: {
        const parent = <ImportStatement>node;
        if (parent.declarations) {
          for (let i = 0; i < parent.declarations.length; i++) {
            if (parent.declarations[i] === currentNode) {
              parent.declarations[i] = node as ImportDeclaration;
              return;
            }
          }
        }

        if (parent.namespaceName === currentNode) {
          parent.namespaceName = node as IdentifierExpression;
          return;
        }

        if (parent.path === currentNode) {
          parent.path = node as StringLiteralExpression;
        }
        return;
      }
      case NodeKind.RETURN: {
        const parent = <ReturnStatement>parentNode;
        if (parent.value === currentNode) {
          parent.value = node;
        }
        return;
      }
      case NodeKind.SWITCH: {
        const parent = <SwitchStatement>parentNode;
        if (parent.condition === currentNode) {
          parent.condition = node;
          return;
        }
        if (parent.cases) {
          for (let i = 0; i < parent.cases.length; i++) {
            if (parent.cases[i] === currentNode) {
              parent.cases[i] = node as SwitchCase;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.THROW: {
        const parent = <ThrowStatement>parentNode;
        if (parent.value === currentNode) {
          parent.value = node;
        }
        return;
      }
      case NodeKind.TRY: {
        const parent = <TryStatement>parentNode;
        if (parent.statements) {
          for (let i = 0; i < parent.statements.length; i++) {
            if (parent.statements[i] === currentNode) {
              parent.statements[i] = node;
              return;
            }
          }
        }
        if (parent.catchVariable === currentNode) {
          parent.catchVariable = node as IdentifierExpression;
          return;
        }
        if (parent.catchStatements) {
          for (let i = 0; i < parent.catchStatements.length; i++) {
            if (parent.catchStatements[i] === currentNode) {
              parent.catchStatements[i] = node;
              return;
            }
          }
        }
        if (parent.finallyStatements) {
          for (let i = 0; i < parent.finallyStatements.length; i++) {
            if (parent.finallyStatements[i] === currentNode) {
              parent.finallyStatements[i] = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.VARIABLE: {
        const variable = <VariableStatement>parentNode;
        if (variable.decorators) {
          for (let i = 0; i < variable.decorators.length; i++) {
            if (variable.decorators[i] === currentNode) {
              variable.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }
        if (variable.declarations) {
          for (let i = 0; i < variable.declarations.length; i++) {
            const declaration = variable.declarations[i];
            if (declaration.name === currentNode) {
              declaration.name = node as IdentifierExpression;
              return;
            }
            if (declaration.initializer === currentNode) {
              declaration.initializer = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.WHILE: {
        const parent = <WhileStatement>parentNode;
        if (parent.condition === parentNode) {
          parent.condition = node;
          return;
        }

        if (parent.statement === currentNode) {
          parent.statement = node;
        }
        return;
      }
      //
      // // declaration statements
      //
      case NodeKind.CLASSDECLARATION: {
        const parent = <ClassDeclaration>parentNode;
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }

        if (parent.implementsTypes) {
          for (let i = 0; i < parent.implementsTypes.length; i++) {
            if (parent.implementsTypes[i] === currentNode) {
              parent.implementsTypes[i] = node as NamedTypeNode;
              return;
            }
          }
        }

        if (parent.extendsType === currentNode) {
          parent.extendsType = node as NamedTypeNode;
          return;
        }

        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === parentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }

        if (parent.typeParameters) {
          for (let i = 0; i < parent.typeParameters.length; i++) {
            if (parent.typeParameters[i] === currentNode) {
              parent.typeParameters[i] = node as TypeParameterNode;
              return;
            }
          }
        }

        if (parent.members) {
          for (let i = 0; i < parent.members.length; i++) {
            if (parent.members[i] === currentNode) {
              parent.members[i] = node as DeclarationStatement;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.ENUMDECLARATION: {
        const parent = <EnumDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }

        if (parent.values) {
          for (let i = 0; i < parent.values.length; i++) {
            if (parent.values[i] === currentNode) {
              parent.values[i] = node as EnumValueDeclaration;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.ENUMVALUEDECLARATION: {
        const parent = <EnumValueDeclaration>parentNode;
        if (parent.type === currentNode) {
          parent.type = node as TypeNode;
          return;
        }
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }
        if (parent.initializer === currentNode) {
          parent.initializer = node;
        }
        return;
      }
      case NodeKind.FIELDDECLARATION: {
        const parent = <FieldDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }

        if (parent.type === currentNode) {
          parent.type = node as TypeNode;
          return;
        }

        if (parent.initializer === currentNode) {
          parent.initializer = node;
        }
        return;
      }
      case NodeKind.FUNCTIONDECLARATION: {
        const parent = <FunctionDeclaration>parentNode;

        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }

        if (parent.typeParameters) {
          for (let i = 0; i < parent.typeParameters.length; i++) {
            if (parent.typeParameters[i] === currentNode) {
              parent.typeParameters[i] = node as TypeParameterNode;
              return;
            }
          }
        }

        if (parent.signature === currentNode) {
          parent.signature = node as FunctionTypeNode;
          return;
        }

        if (parent.body === parentNode) {
          parent.body = node;
        }
        return;
      }
      case NodeKind.IMPORTDECLARATION: {
        const parent = <ImportDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }

        if (parent.foreignName === currentNode) {
          parent.foreignName = node as IdentifierExpression;
          return;
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
        }
        return;
      }
      case NodeKind.INTERFACEDECLARATION: {
        const parent = <InterfaceDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
            }
          }
        }

        if (parent.extendsType === currentNode) {
          parent.extendsType = node as NamedTypeNode;
          return;
        }

        if (parent.implementsTypes) {
          for (let i = 0; parent.implementsTypes.length; i++) {
            if (parent.implementsTypes[i] === currentNode) {
              parent.implementsTypes[i] = node as NamedTypeNode;
              return;
            }
          }
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }

        if (parent.members) {
          for (let i = 0; i < parent.members.length; i++) {
            if (parent.members[i] === currentNode) {
              parent.members[i] = node as DeclarationStatement;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.METHODDECLARATION: {
        const parent = <MethodDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
            }
          }
        }
        if (parent.signature === currentNode) {
          parent.signature = node as FunctionTypeNode;
          return;
        }
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }
        if (parent.typeParameters) {
          for (let i = 0; i < parent.typeParameters.length; i++) {
            if (parent.typeParameters[i] === currentNode) {
              parent.typeParameters[i] = node as TypeParameterNode;
              return;
            }
          }
        }
        if (parent.body === currentNode) {
          parent.body = node;
        }
        return;
      }
      case NodeKind.NAMESPACEDECLARATION: {
        const parent = <NamespaceDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }
        if (parent.members) {
          for (let i = 0; i < parent.members.length; i++) {
            if (parent.members[i] === currentNode) {
              parent.members[i] = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.TYPEDECLARATION: {
        const parent = <TypeDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }
        if (parent.typeParameters) {
          for (let i = 0; i < parent.typeParameters.length; i++) {
            if (parent.typeParameters[i] === currentNode) {
              parent.typeParameters[i] = node as TypeParameterNode;
              return;
            }
          }
        }
        if (parent.type === currentNode) {
          parent.type = node as TypeNode;
        }
        return;
      }
      case NodeKind.VARIABLEDECLARATION: {
        const parent = <VariableDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }
        if (parent.type === currentNode) {
          parent.type = node as TypeNode;
          return;
        }
        if (parent.initializer === currentNode) {
          parent.initializer = node;
        }
        return;
      }
      //
      // // other
      //
      case NodeKind.DECORATOR: {
        const parent = <DecoratorNode>parentNode;
        if (parent.name === currentNode) {
          parent.name = node;
          return;
        }

        if (parent.arguments) {
          for (let i = 0; i < parent.arguments.length; i++) {
            if (parent.arguments[i] === currentNode) {
              parent.arguments[i] = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.EXPORTMEMBER: {
        const parent = <ExportMember>parentNode;
        if (parent.exportedName === currentNode) {
          parent.exportedName = node as IdentifierExpression;
          return;
        }
        if (parent.localName === currentNode) {
          parent.localName = node as IdentifierExpression;
        }
        return;
      }
      case NodeKind.PARAMETER: {
        const parent = <ParameterNode>parentNode;
        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }
        if (parent.type === currentNode) {
          parent.type = node as TypeNode;
          return;
        }
        if (parent.initializer === currentNode) {
          parent.initializer = node;
        }
        return;
      }
      case NodeKind.SWITCHCASE: {
        const parent = <SwitchCase>parentNode;
        if (parent.label === currentNode) {
          parent.label = node;
          return;
        }

        if (parent.statements) {
          for (let i = 0; i < parent.statements.length; i++) {
            if (parent.statements[i] === parentNode) {
              parent.statements[i] = node;
              return;
            }
          }
        }
        return;
      }
      case NodeKind.INDEXSIGNATUREDECLARATION: {
        const parent = <IndexSignatureDeclaration>parentNode;
        if (parent.decorators) {
          for (let i = 0; i < parent.decorators.length; i++) {
            if (parent.decorators[i] === currentNode) {
              parent.decorators[i] = node as DecoratorNode;
              return;
            }
          }
        }
        if (parent.keyType === currentNode) {
          parent.keyType = node as NamedTypeNode;
          return;
        }

        if (parent.name === currentNode) {
          parent.name = node as IdentifierExpression;
          return;
        }

        if (parent.valueType === currentNode) {
          parent.valueType = node as TypeNode;
        }
        return;
      }
      default:
        throw new Error(
          "Invalid replace parent node type " + NodeKind[parentNode.kind]
        );
    }
  }

  visitCallExpression(expr: CallExpression): void {
    if (expr.expression.kind === NodeKind.IDENTIFIER) {
      const lhs = expr.expression as IdentifierExpression;
      if (lhs.text === "utf8") {
        transformUTF8Call(this, expr);
      }
      if (lhs.text === "char") {
        transformCharCall(this, expr);
      }
    }
    return super.visitCallExpression(expr);
  }
}

function transformUTF8Call(visitor: Visitor, expr: CallExpression): void {
  const args = expr.arguments;
  const typeArgs = expr.typeArguments;
  if (typeArgs && typeArgs.length !== 0)
    throw new Error("Invalid utf8 call, type arguments must be 0.");
  if (!args) throw new Error("Invalid utf8 call.");
  if (args.length === 0 || args.length > 2)
    throw new Error("Invalid utf8 call.");

  const arg = args[0];
  const nullTerminated = args[1];
  let addNull = false;
  if (nullTerminated) {
    if (nullTerminated.kind === NodeKind.TRUE) {
      addNull = true;
    } else {
      throw new Error("Invalid utf8 call.");
    }
  }

  if (arg.kind === NodeKind.LITERAL) {
    const lit = arg as LiteralExpression;
    if (lit.literalKind === LiteralKind.STRING) {
      const range = lit.range;
      const utf8 = Buffer.from(
        (lit as StringLiteralExpression).value + (addNull ? "\0" : "")
      );
      const result = TypeNode.createAssertionExpression(
        AssertionKind.AS,
        TypeNode.createArrayLiteralExpression(
          Array.from(utf8).map((value) =>
            TypeNode.createIntegerLiteralExpression(
              Long.fromNumber(value, true) as any,
              range
            )
          ),
          range
        ),
        TypeNode.createNamedType(
          TypeNode.createTypeName(
            TypeNode.createIdentifierExpression("StaticArray", range),
            range
          ),
          [
            TypeNode.createNamedType(
              TypeNode.createTypeName(
                TypeNode.createIdentifierExpression("u8", range),
                range
              ),
              [],
              false,
              range
            ),
          ],
          false,
          range
        ),
        lit.range
      );
      visitor.replaceNode(result);
      return;
    }
  }
  throw new Error("Invalid utf8 call. Must be called with a string argument.");
}

function transformCharCall(visitor: Visitor, expr: CallExpression): void {
  const args = expr.arguments;
  const typeArgs = expr.typeArguments;
  if (typeArgs && typeArgs.length !== 0)
    throw new Error("Invalid char() call, type arguments must be 0.");
  if (!args || args.length !== 1) throw new Error("Invalid char() call.");

  const arg = args[0];
  if (arg.kind === NodeKind.LITERAL) {
    const lit = arg as LiteralExpression;
    if (lit.literalKind === LiteralKind.STRING) {
      const value = (lit as StringLiteralExpression).value;
      const range = lit.range;
      if (value.length === 1) {
        visitor.replaceNode(
          TypeNode.createAssertionExpression(
            AssertionKind.AS,
            TypeNode.createIntegerLiteralExpression(
              Long.fromNumber(value.charCodeAt(0)!, true) as any,
              range
            ),
            TypeNode.createNamedType(
              TypeNode.createTypeName(
                TypeNode.createIdentifierExpression("u8", range),
                range
              ),
              [],
              false,
              range
            ),
            range
          )
        );
        return;
      }
    }
  }
  throw new Error("Invalid char() call.");
}

export = class BuiltinUTF8Transform extends Transform {
  afterParse(parser: Parser) {
    const v = new Visitor();
    for (const source of parser.sources) {
      v.visitNode(source);
    }
  }
};
